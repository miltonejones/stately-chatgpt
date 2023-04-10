
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
      entry: "resetSession",
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
    sessions: {}, 
    answers: [],
    temperatureIndex: 1,
    lang_code: 'es-ES', // 'en-US',
    demoLanguages,
    responseType: 'text',
    typeProps:  [
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
    tempProps: [
       {
        value: 0.1,
        label: "Precise",
        caption: "Little creativity, high confidence responses",
        color: "primary"
       },

       {
        value: 0.6,
        label: "Thoughtful",
        caption: "More creativity, less precise verbose responses",
        color: "secondary"
       },
 
       {
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
    isVocal: context => !!context.responseText && !context.silent && context.responseType === 'text',
    isDefaultLang: context => context.lang_code === DEFAULT_LANG

  },
  actions: {
    clearText: assign({ responseText: null }),
    assignTest: assign((_, event) => { 
      return {
        requestText: "show me a sample react function using the AWS SDK that saves a file to NoSQL using aws-amplify. use the currently logged in username as the file id"
      }
    }),
    dropSession: assign((context, event) => {
      const { sessions } = context;
      delete sessions[event.question];
      return {
        sessions,
        answers: []
      }
     
    }),
    commitSession: assign((context, event) => {
      const { answers } = context;
      if  (answers.length) {
        const { question } = answers[answers.length - 1];
        return {
          requestText: '',
          responseText: '',
          answers: [],
          sessions: { 
            ...context.sessions,
            [question]: answers
          }
        } 
      }
    }),
    assignTime: assign((_, event) => {
      return {
        timestamp: new Date().getTime()
      } 
    }),
    assignModels: assign((_, event) => {
      return {
        models: event.data
      } 
    }),
    assignUser: assign((_, event) => {
      return {
        user: event.user
      } 
    }),
    assignIndex: assign((_, event) => {
      return {
        start_index: event.index
      } 
    }),
    assignSession: assign((_, event) => {
      return {
        sessions: event.data
      } 
    }),
    applyChanges: assign((_, event) => {
      return {
        [event.key]: event.value
      } 
    }),
    
    assignPreviousAnswers: assign((_, event) => {
      return {
        answers: event.answers
      } 
    }),
    resetSession: assign((context, event) => {
      return {
        answers: []
      } 
    }),
    assignHeard: assign((_, event) => { 
      return {
        requestText: event.result
      }
    }),
    assignResponse: assign((context, event) => { 
      const { requestText, responseType } = context;
      const { data, choices } = event.data;

      if (responseType === 'image') {
         const { url } = data[0]
        
          return {
            responseText: url,
            requestText: "",
            answers: [{
              responseType,
              responseTime: new Date().getTime() - context.timestamp,
              question: context.requestText,
              answer: `![${requestText}](${url})`,
              id: uniqueId()
            }].concat (context.answers) 
          }

      }

      if (!choices?.length) return {
        responseText: "Could not parse response"
      }
      const { message } = choices[0]; 

      return {
        responseText: message.content,
        requestText: "",
        answers: [{
          responseTime: new Date().getTime() - context.timestamp,
          question: context.requestText,
          answer: message.content,
          id: uniqueId()
        }].concat (context.answers) 
      }
    }),

    assignTranslate: assign((context, event) => {
      const { lang_code } = context;
      const [ code ] = lang_code.split('-');
      const prop = event.data[code];
      return {
        responseText: prop.value,
        translation: ""
      }
    }), 
  }
});

export const useChat = () => {  
  const clipboard = useClipboard()

  const [state, send] = useMachine(chatMachine, {
    services: {
      loadModels: async() => {
        return await getModels();
      },
      stopListening: async() => {
        return recognition.stop();
      },
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
                // console.log('JSON file retrieved:', json);
                resolve(json)
              };
            } catch (ex) {
              console.log (ex)
            } 
          }) 
        } 
      },
      speakText: async (context) => {
        const { responseText, lang_code } = context;
        speek(responseText, lang_code)
      },
      storeSession: async(context) => {
        localStorage.setItem('goat-chat', JSON.stringify(context.sessions));
        if (!context.user) return;
        const { userDataKey } = context.user;  
        const filename = `${userDataKey}.json`; 
        await Storage.put(filename, JSON.stringify(context.sessions), {
          contentType: 'application/json'
        }); 
      },
      dropSessions: async(context) => {
        localStorage.removeItem('goat-chat');
        if (!context.user) return;
        const { userDataKey } = context.user;  
        const filename = `${userDataKey}.json`; 
        await Storage.remove(filename); 
      },
      startListening: async() => {
        return recognition.start();
      },

      assignClicks: async (context) => {
        const handleClick = event => {
          clipboard.copy (event.target.innerText);
        }
        attachPreclick(handleClick);
      },

      loadTranslation: async(context) => {
        const { responseText, lang_code } = context; 
        const [ code ] = lang_code.split('-'); 
        return await translateText(code, removeBackslashStrings(responseText));
      },
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

        return await generateText (convo, value)
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

  const theme = useTheme();
  const isMobileViewPort = useMediaQuery(theme.breakpoints.down('md'));

  return {
    state,
    send, 
    diagnosticProps: {
      ...chatMachine,
      state,
      send,
    },
    isMobileViewPort,
    ...state.context
  };
}

const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true; 


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


const generateText = async (messages, temperature) => {
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
      max_tokens: 1024, 
    }),
  };
  const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions );
  const json = await response.json();
 
  return json;
};


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
 

const utterThis = new SpeechSynthesisUtterance()
const speek = (msg, lang) => {  
  const synth = window.speechSynthesis;
  utterThis.lang = lang || "en-US";
  utterThis.text = removeBackslashStrings(msg)
  synth.speak(utterThis)
}



const API_ENDPOINT = 'https://69ksjlqa37.execute-api.us-east-1.amazonaws.com';


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
  const response = await fetch(API_ENDPOINT, requestOptions );
  return await response.json();
};
 




function attachPreclick(handleClick) {
  const preTags = document.querySelectorAll("pre");
  preTags.forEach((tag) => {
    tag.addEventListener("click", handleClick);
  });

  return () => {
    preTags.forEach((tag) => {
      tag.removeEventListener("click", handleClick);
    });
  };
}
