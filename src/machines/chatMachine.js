
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";
import { useMediaQuery, useTheme } from '@mui/material';
import { Storage } from 'aws-amplify';
import { removeBackslashStrings } from '../util/removeBackslashStrings';
import { uniqueId } from '../util/uniqueId';
import useClipboard from '../hooks/useClipboard';


const demoLanguages = { 
  Danish: 'da-DK',
  Dutch: 'nl-NL',
  English: 'en-US',
  French: 'fr-FR',
  German: 'de-DE', 
  Italian: 'it-IT',
  Japanese: 'ja-JP', 
  'Portuguese (Portugal, Brazil)': 'pt-PT', 
  Spanish: 'es-ES',
};

const DEFAULT_LANG = 'en-US';


// add machine code
const chatMachine = createMachine({
  id: "chat_gpt",
  initial: "idle",
  states: {
    
    idle: {
      description: "Machine waits in idle request accepting no requests",
      entry:["reloadChanges", "resetSession"],
      initial: "loading",
      states: {
        loading: {
          description: "Restore session data from storage",
          invoke: {
            src: "loadSession",
            onDone: [
              {
                target: "ready",
                actions: "assignSession",
              },
            ],
            onError: [
              {
                target: "ready", 
              },
            ],
          },
        },
        ready: {
          on: {
            ASK: {
              target: "#chat_gpt.listening",
            },
          },
        },
      },
      on: {
        TEXT: {
          target: "#chat_gpt.request.query",
        },
      },
    },
    listening: {
      initial: 'start',
      states: {
        start: {
          description:
            'Start the speech recognition object and move to talking state.',
          invoke: {
            src: 'startListening',
            onDone: [
              {
                target: 'talking',
                description:
                  'Transition to listen mode to capture voice input.',
              },
            ],
          },
        },
        talking: {
          description:
            'Listen for spoken input until sound stops or user cancels.',
          on: {
            HEARD: {
              target: 'stopping',
              actions: 'assignHeard',
              description: 'Assign transcribed text to state context.',
            },
            STOP: {
              target: 'stopping',
              description: 'User stops the recognition engine',
            },
          },
        },
        stopping: {
          description:
            'Stop the speech recognition object and move to request state for processing.',
          invoke: {
            src: 'stopListening',
            onDone: [
              {
                target: '#chat_gpt.request',
              },
            ],
          },
        },
      },
    },
    request: {
      initial: 'query',
      states: {
        query: {
          entry: "assignTime",
          description:
            'Send request to ChatGPT API and append answer to session',
          invoke: {
            src: 'sendChatRequest',
            onDone: [
              {
                target: 'response',
                actions: 'assignResponse',
              },
            ],
          },
        },

        response: {
          description: "Render response to UI and wait for next question in this session",
          initial: "pause",
          states: {
            pause: {
              after: {
                "1000": [
                  {
                    target: "#chat_gpt.speak",
                    cond: "isVocal",
                  },
                  {
                  target: "#chat_gpt.request.response.rendered",
                  actions: [],
                  description: "Pause to let answers render",
                  internal: false,
                }],
              }, 
            },
            rendered: {
              invoke: {
                src: "assignClicks",
              }
            },
          },
          on: {
            ASK: {
              target: "#chat_gpt.listening",
            },
            TEXT: {
              target: "query",
              actions: "assignIndex"
            },
          },
        },
      },
      on: {
        QUIT: {
          target: "persist",
          actions: 'commitSession',
          description: 'Save session to session log',
        },
      },
    },
    persist: {
      description: "Save session data to storage",
      invoke: {
        src: "storeSession",
        onDone: [
          {
            target: "idle",
          },
        ],
      },
    },
    clearing: {
      invoke: {
        src: "dropSessions",
        onDone: [
          {
            target: "idle",
          },
        ],
      },
    },
    speak: {
      initial: 'read_text',
      states: {
        read_text: {
          always: [
            {
              target: 'say_text',
              cond: 'isDefaultLang',
            },
            {
              target: 'translate',
            },
          ],
        },
        say_text: {
          description: 'Use speech utterance object to vocalize the result',
          invoke: {
            src: 'speakText',
            onDone: [
              {
                target: '#chat_gpt.request.response',
                actions: "clearText"
              },
            ],
          },
        },
        translate: {
          invoke: {
            src: 'loadTranslation',
            onDone: [
              {
                target: 'say_text',
                actions: 'assignTranslate',
              },
            ],
          },
        },
      },
    },

  },
  on: {
    CHANGE: {
      description: 'Update state context property values.',
      actions: 'applyChanges'
    },
    RESTORE: {
      target: ".request.response",
      actions: "assignPreviousAnswers",
      description: "Restore answers from previous session",
    },
    AUTH: {
      actions: "assignUser",
      target: ".idle.loading",
    },
    CLEAR: {
      target: ".clearing",
    },
    DROP: {
      target: ".persist",
      actions: "dropSession",
      description: "Drop selected session from user memory",
    },
  }, 
  context: {
    // Object containing session data for each question
    sessions: {},
    // Array of objects containing previous answers from the current session
    answers: [],
    // Index representing the temperature value for the ChatGPT API
    temperatureIndex: 1,
    // Code for the language to use for API requests and responses
    lang_code: DEFAULT_LANG,
    // Array of objects representing available languages for translation
    demoLanguages,
    // Type of response to expect from the ChatGPT API ('text' or 'image')
    responseType: 'text',
    // Maximum number of tokens to generate for each response
    max_tokens: 7,
    // Array of objects representing available response types (text or image)
    typeProps: [
      {
        icon: "TextFields",
        caption:"Return text answers to chat prompts",
        value: "text",
        label: "Conversations"
      },
      {
        icon: "Photo",
        caption:"Return images you describe",
        value: "image",
        label: "Images"
      }
    ],
    // Array of objects representing available temperature levels for the ChatGPT API 
    tempProps: [
       {
        value: 0.1,
        icon: "SquareFoot",
        label: "Precise",
        caption: "Little creativity, high confidence responses",
        color: "primary"
       },

       {
        icon: "EmojiObjects",
        value: 0.6,
        label: "Thoughtful",
        caption: "More creativity, less precise responses",
        color: "secondary"
       },
 
       {
        icon: "Palette",
        value: 0.9,
        label: "Creative",
        caption: "Use this option when you're feeling lucky",
        color: "error"
       },
    ]
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
},
{
  guards: {
    // Check if there is a response text and that the response type is 'text', and that the state is not set to 'silent'
    isVocal: context => !!context.responseText && !context.silent && context.responseType === 'text',
    // Check if the language code in the context is set to the default language
    isDefaultLang: context => context.lang_code === DEFAULT_LANG
  },
  actions: {
    /**
     * Clears the `responseText` property in the state context.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition (not used in this action).
     * @returns {object} A new context object with the `responseText` property set to `null`.
     */
    clearText: assign({ responseText: null }), 

    /**
     * Deletes the session data associated with the specified question from the `sessions` property in the state context.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition, containing the `question` property identifying the session to be deleted.
     * @returns {object} A new context object with the specified session data removed from the `sessions` property.
     */
    dropSession: assign((context, event) => {
      const { sessions } = context;
      
      // Delete the session data associated with the specified question from the `sessions` property in the context
      delete sessions[event.question];

      // Return a new context object with the specified session data removed from the `sessions` property
      return {
        sessions,
        answers: []
      };
    }), 

    /**
     * Saves the current session data to storage when the QUIT event is received.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition.
     * @returns {object} A new context object with the session data saved to storage.
     */
    commitSession: assign((context, event) => {
      const { answers } = context;
      
      // If answers is not empty, extract the question property from the last answer
      if (answers.length) {
        const { question } = answers[answers.length - 1];
        
        // Store the entire answers array in the sessions object using the question property as the key
        return {
          requestText: '',
          responseText: '',
          answers: [],
          sessions: { 
            ...context.sessions,
            [question]: answers
          }
        };
      }
      
      // If answers is empty, return a new context object with an empty answers array
      return {
        requestText: '',
        responseText: '',
        answers: [],
        sessions: context.sessions
      };
    }),

    assignTime: assign({
      timestamp: new Date().getTime()
    }),

    assignModels: assign((_, event) => ({
      models: event.data
    })),

    assignIndex: assign((_, event) => ({
      start_index: event.index
    })),

    assignSession: assign((_, event) => ({
      sessions: event.data
    })),

    assignPreviousAnswers: assign((_, event) => ({
      answers: event.answers
    })),

    resetSession: assign({ answers: [] }),

    assignHeard: assign((_, event) => ({
      requestText: event.result
    })),

    /**
     * Assigns the authenticated user to the `user` property in the state context.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition, which includes the authenticated user object as `event.user`.
     * @returns {object} A new context object with the authenticated user assigned to the `user` property.
     */
    assignUser: assign((context, event) => {
      
      // Extract the authenticated user object from the event
      const { user } = event;
      
      // Return a new context object with the authenticated user assigned to the `user` property
      return {
        ...context,
        user,
        lang_code: user?.attributes?.locale || 'es-ES'
      };
    }),


    // assignUser: assign((_, event) => {
    //   return {
    //     user: event.user,
    //     lang_code: event.user?.attributes?.locale || 'es-ES'
    //   } 
    // }),
    

    /**
     * Loads the saved properties from local storage and returns them as a new context object.
     * @function
     * @returns {object} A new context object with the saved properties from local storage, or an empty object if no properties are found.
     */
    reloadChanges: assign(() => {
  
      // Load the saved properties from local storage
      const props = localStorage.getItem('goat-props');
      
      // Return a new context object with the saved properties, or an empty object if no properties are found
      return props ? JSON.parse(props) : {};
    }),

 
    /**
     * Updates the state context property values based on the key-value pairs provided in the event, and saves the updated context to local storage.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition, containing key-value pairs to update the state context.
     * @returns {object} A new context object with the updated property values assigned to it.
     */
    applyChanges: assign((context, event) => {
      const { props: old } = context;
      
      // Update the property values in the context based on the key-value pairs provided in the event
      const props = {
        ...old,
        [event.key]: event.value,
      }

      // Remove the `requestText` property, if present, as it should not be persisted to local storage
      delete props.requestText;

      // Save the updated context to local storage
      localStorage.setItem('goat-props', JSON.stringify(props));

      // Return a new context object with the updated property values assigned to it
      return {
        [event.key]: event.value,
        props
      };
    }),
 
    /**
     * Assigns the response received from the ChatGPT API to the context, along with other metadata such as response time and question/answer IDs.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition.
     * @returns {object} A new context object with the response data assigned to it.
     */
    assignResponse: assign((context, event) => { 
      const { requestText, responseType } = context;
      const { data, choices } = event.data;

      // If the response type is 'image', extract the image URL from the response data and format it as a markdown link
      if (responseType === 'image') {
        const { url } = data[0];
        return {
          responseText: url,
          requestText: "",
          answers: [{
            responseType,
            responseTime: new Date().getTime() - context.timestamp,
            question: context.requestText,
            answer: `![${requestText}](${url})`,
            id: uniqueId()
          }].concat(context.answers) 
        };
      }

      // If there are no choices in the response, return an error message
      if (!choices?.length) return {
        responseText: "Could not parse response"
      }

      // Otherwise, extract the message content from the first choice and store it in the answers array
      const { message, finish_reason } = choices[0]; 
      return {
        responseText: message.content,
        requestText: "",
        answers: [{
          responseType,
          responseTime: new Date().getTime() - context.timestamp,
          question: context.requestText,
          finish_reason,
          answer: message.content,
          id: uniqueId()
        }].concat(context.answers) 
      };
    }), 
 
    /**
     * Assigns the translated text received from the translation API to the context, using the target language code specified in the context.
     * @function
     * @param {object} context - The current context of the state machine.
     * @param {object} event - The event that triggered the state transition.
     * @returns {object} A new context object with the translated text assigned to it.
     */
    assignTranslate: assign((context, event) => {
      const { lang_code } = context;

      // Extract the language code from the context and use it to retrieve the translated text from the translation API response
      const [ code ] = lang_code.split('-');
      const prop = event.data[code];

      // Return a new context object with the translated text assigned to it
      return {
        responseText: prop.value,
        translation: ""
      };
    }),
 
  }
});

/**
 * A custom React hook that provides chat-related functionality, including speech recognition, text-to-speech,
 * chat session management, and translation services.
 * @function useChat
 * @returns {Object} An object that includes the current state of the chat machine, the ability to send events to the machine,
 * a clipboard object for copying chat messages, diagnostic properties for debugging purposes, a boolean value indicating if the viewport is
 * mobile, and the current context of the chat machine.
 */
export const useChat = () => {  
  const clipboard = useClipboard()

  const [state, send] = useMachine(chatMachine, {
    services: {
          /**
           * Loads all available models for the chat machine from the server.
           * @async
           * @function loadModels
           * @returns {Promise<Object>} - A promise that resolves to an object containing all available models.
           */
          loadModels: async() => {
            return await getModels();
        },

        /**
         * Stops speech recognition.
         * @async
         * @function stopListening
         * @returns {Promise<void>} - A promise that resolves when speech recognition has stopped.
         */
        stopListening: async() => {
            return recognition.stop();
        },

        /**
         * Starts speech recognition.
         * @async
         * @function startListening
         * @returns {Promise<void>} - A promise that resolves when speech recognition has started.
         */
        startListening: async() => {
            return recognition.start();
        },

      /**
       * Speaks the given text using the system's text-to-speech (TTS) functionality.
       * @async
       * @function speakText
       * @param {Object} context - The current context object of the chat machine.
       * @param {string} context.responseText - The text to be spoken.
       * @param {string} context.lang_code - The language code for the text to be spoken.
       * @returns {Promise<void>} - A promise that resolves when the text has been spoken.
       */
      speakText: async (context) => {
        const { responseText, lang_code } = context;
        speek(responseText, lang_code)
      },
      
      /**
       * Loads a previously saved chat session for the user from AWS S3 or local storage. 
       * @async
       * @function loadSession
       * @param {Object} context - The context object passed to the XState machine.
       * @param {Object} context.user - The user object containing the `userDataKey` property.
       * @returns {Promise<Object>} A promise that resolves to the parsed JSON content of the chat session file.
       * If the file is not found or there is no user, the promise resolves to an empty object ({})
       * or undefined.
       * @throws {Error} If an error occurs during file retrieval or parsing, the function logs an error message to the console
       * and returns undefined.
       */
      loadSession: async(context) => {
        if (!context.user) return JSON.parse(localStorage.getItem('goat-chat') || "{}"); 

        const { userDataKey } = context.user; 
        const filename = `${userDataKey}.json`;

        const file = await Storage.get(filename, {
          download: true,
          contentType: 'application/json'
        });

        if (file?.Body) {  
          return await new Promise(resolve => { 
            try { 
              const reader = new FileReader();
              reader.readAsText(file.Body);
  
              reader.onload = () => {
                const json = JSON.parse(reader.result); 
                resolve(json)
              };
            } catch (ex) {
              console.log (ex)
            } 
          }) 
        } 
      },

      /**
       * Stores the current chat session in both the browser's localStorage and an AWS S3 bucket.
       * @async
       * @function storeSession
       * @param {Object} context - The current context object of the chat machine.
       * @param {Object} context.sessions - An object containing the chat session data to be stored.
       * @param {Object} context.user - An object containing information about the current user (optional).
       * @param {string} context.user.userDataKey - A unique identifier for the user's data.
       * @returns {Promise<void>} - A promise that resolves when the session data has been successfully stored.
       */
      storeSession: async(context) => {
        localStorage.setItem('goat-chat', JSON.stringify(context.sessions));
        if (!context.user) return;
        const { userDataKey } = context.user;  
        const filename = `${userDataKey}.json`; 
        await Storage.put(filename, JSON.stringify(context.sessions), {
          contentType: 'application/json'
        }); 
      },

      /**
       * Removes the current chat session from both the browser's localStorage and an AWS S3 bucket.
       * @async
       * @function dropSessions
       * @param {Object} context - The current context object of the chat machine.
       * @param {Object} context.user - An object containing information about the current user (optional).
       * @param {string} context.user.userDataKey - A unique identifier for the user's data.
       * @returns {Promise<void>} - A promise that resolves when the session data has been successfully removed.
       */
      dropSessions: async(context) => {
        localStorage.removeItem('goat-chat');
        if (!context.user) return;
        const { userDataKey } = context.user;  
        const filename = `${userDataKey}.json`; 
        await Storage.put(filename, "{}", {
          contentType: 'application/json'
        }); 
      },

      /**
       * Assigns a click handler to each chat message, which copies the message text to the clipboard.
       * @async
       * @function assignClicks
       * @param {Object} context - The current context object of the chat machine.
       * @returns {Promise<void>} - A promise that resolves when the click handlers have been assigned.
       */
      assignClicks: async (context) => {
        const handleClick = event => {
          clipboard.copy (event.target.innerText);
        }
        attachPreclick(handleClick);
      },

      /**
       * Translates text to a specified language using an external translation service.
       * @async
       * @function loadTranslation
       * @param {Object} context - The current context object of the chat machine.
       * @param {string} context.responseText - The text to be translated.
       * @param {string} context.lang_code - The language code for the desired translation language.
       * @returns {Promise<string>} - A promise that resolves to the translated text.
       */
      loadTranslation: async(context) => {
        const { responseText, lang_code } = context; 
        const [ code ] = lang_code.split('-'); 
        return await translateText(code, removeBackslashStrings(responseText));
      },

      /**
       * Sends a chat request to the backend server and returns the response.
       * @async
       * @function sendChatRequest
       * @param {Object} context - The current context object of the chat machine.
       * @param {string} context.requestText - The text of the chat request.
       * @param {string} context.responseType - The type of response expected from the server (text or image).
       * @param {Object[]} context.answers - An array of previous chat messages and their responses.
       * @param {Object[]} context.tempProps - An array of objects containing properties for generating chat responses.
       * @param {number} context.temperatureIndex - The index of the current temperature value to use for generating chat responses.
       * @param {number} context.start_index - The index of the first previous chat message to include in the request.
       * @returns {Promise<string|Blob>} - A promise that resolves to either a text response or an image Blob.
       */
      sendChatRequest: async(context) => {
        const { requestText, responseType, answers, tempProps, 
                temperatureIndex, start_index } = context;
        const { value } = tempProps[temperatureIndex];
        const create = q => ({"role": "user", "content": q.question});
        const size = isMobileViewPort ? 256 : 1024;

        const convo = !!start_index 
          ? answers.slice(0, start_index + 1).map(create) 
          : answers.map(create)
              .concat({"role": "user", "content": requestText});

        if (responseType === 'image') {
          return generateImage(requestText, size)
        }

        return await generateText (convo, value, Math.pow(2, context.max_tokens))
      },
   },
  }); 
  
  recognition.addEventListener("result",  (event) => { 
    const result = event.results[event.resultIndex][0].transcript; 
    send({
      type: 'HEARD',
      result
    });
  }); 

  // This line of code declares a constant variable called "theme" and assigns it the value returned by the "useTheme()" hook.
  const theme = useTheme();

  // This line of code declares a constant variable called "isMobileViewPort" and assigns it the value returned by the "useMediaQuery()" hook, 
  // passing in the "down('md')" parameter to specify that the breakpoint should be for screens smaller than or equal to medium size.
  const isMobileViewPort = useMediaQuery(theme.breakpoints.down('md'));
 
  return {
    state,
    send, 
    clipboard,
    diagnosticProps: {
      ...chatMachine,
      state,
      send,
    },
    isMobileViewPort,
    ...state.context
  };
} 


/**
 * Creates a new `webkitSpeechRecognition` object, sets the recognition language to 'en-US', and sets the recognition mode to continuous.
 * Also creates a new `SpeechSynthesisUtterance` object.
 * @constant {webkitSpeechRecognition} recognition 
 */
const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;  


/**
 * Generates an image using OpenAI's API.
 *
 * @async
 * @function
 * @param {string} prompt - The prompt to generate the image from.
 * @param {number} width - The width of the generated image.
 * @returns {Promise<Object>} - The generated image in JSON format.
 */
const generateImage = async(prompt, width) => {
  const model = 'image-alpha-001';
  const num_images = 1;
  const size = `${width}x${width}`;
  const response_format = 'url';
  const message = {
    prompt,
    model,
    num_images,
    size,
    response_format,
  }
  const requestOptions = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
    },
    body: JSON.stringify(message ),
  };
  const response = await fetch('https://api.openai.com/v1/images/generations', requestOptions );
  const json = await response.json();
  return json;
}
 


/**
 * Generates text using OpenAI's GPT-3 API
 * @async
 * @function
 * @param {string[]} messages - Array of strings representing the conversation history
 * @param {number} temperature - A number between 0 and 1 representing the creativity of the generated text
 * @returns {Promise<Object>} - A Promise that resolves with an object representing the generated text
 */
const generateText = async (messages, temperature, max_tokens = 128) => {
  const requestOptions = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      temperature,
      model: "gpt-3.5-turbo",
      max_tokens
    }),
  };

  /**
   * Sends a POST request to OpenAI's API and returns a Promise that resolves with the response JSON
   * @async
   * @function
   * @param {string} url - The URL to send the request to
   * @param {Object} options - The options to include in the request
   * @returns {Promise<Object>} - A Promise that resolves with the response JSON
   */
  const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions );
  const json = await response.json();
  return json;
};

 
 
 /**
 * Retrieves the list of available OpenAI models using a GET request to the OpenAI API.
 * @async
 * @function getModels
 * @returns {Promise<object>} - A promise that resolves to an object containing the list of available OpenAI models.
 */
const getModels = async () => { 
  const requestOptions = {
    method: "GET",
    headers: { 
      'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
    }, 
  };
  const response = await fetch('https://api.openai.com/v1/models', requestOptions );
  const json = await response.json(); 
  return json;
};
 


/**
 * Speaks the given message in the specified language using the built-in browser speech synthesis API.
 * @param {string} msg - The message to be spoken.
 * @param {string} [lang="en-US"] - The language in which the message should be spoken. Defaults to "en-US".
 * @returns {void}
 */
const speek = (msg, lang) => {
  const synth = window.speechSynthesis;
  const utterThis = new SpeechSynthesisUtterance();
  utterThis.lang = lang || "en-US";
  utterThis.text = removeBackslashStrings(msg);
  synth.speak(utterThis);
}

 const REACT_APP_TRANSLATE_ENDPOINT = "https://69ksjlqa37.execute-api.us-east-1.amazonaws.com";
/**
 * Translates the given text to the specified target language using a third-party translation API.
 * @async
 * @function translateText
 * @param {string} target - The target language code for the translation.
 * @param {string} value - The text to be translated.
 * @returns {Promise<object>} - A promise that resolves to an object containing the translated text.
 */
export const translateText = async (target, value) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: 'en',
      value,
      target: [target]
    }),
  };
  const response = await fetch(REACT_APP_TRANSLATE_ENDPOINT, requestOptions );
  return await response.json();
};
 


/**
 * Attaches a click event listener to all <pre> tags in the document, invoking the specified click handler when a tag is clicked.
 * @function attachPreclick
 * @param {function} handleClick - The click event handler to be attached to the <pre> tags. 
 */
function attachPreclick(handleClick) {
  const preTags = document.querySelectorAll("pre");
  preTags.forEach((tag) => {
    tag.addEventListener("click", handleClick);
  }); 
}
