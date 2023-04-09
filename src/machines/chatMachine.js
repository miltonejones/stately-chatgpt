
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";
import { Storage } from 'aws-amplify';

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
          description:
            'Render response to UI and wait for next question in this session',
          on: {
            ASK: {
              target: '#chat_gpt.listening',
            },
            TEXT: {
              target: 'query',
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
    },
  },
  context: {
    sessions: {}, 
    answers: [],
    temperatureIndex: 1,
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
        value: 0.6,
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
  actions: {
    assignTest: assign((_, event) => { 
      return {
        requestText: "show me a sample react function using the AWS SDK that saves a file to NoSQL using aws-amplify. use the currently logged in username as the file id"
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

      const { choices } = event.data;
      if (!choices?.length) return {
        responseText: "Could not parse response"
      }

      const { message } = choices[0];

      return {
        responseText: message.content,
        answers: [{
          question: context.requestText,
          answer: message.content
        }].concat (context.answers) 
      }
    }),
  }
});

export const useChat = () => {
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
      storeSession: async(context) => {
        localStorage.setItem('goat-chat', JSON.stringify(context.sessions));
        if (!context.user) return;
        const { userDataKey } = context.user;  
        const filename = `${userDataKey}.json`; 
        await Storage.put(filename, JSON.stringify(context.pins), {
          contentType: 'application/json'
        }); 
      },
      startListening: async() => {
        return recognition.start();
      },
      sendChatRequest: async(context) => {
        const { answers, tempProps, temperatureIndex } = context;
        const { value } = tempProps[temperatureIndex]
        const convo = answers.map(q => ({"role": "user", "content": q.question}))
          .concat({"role": "user", "content": context.requestText})
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

  return {
    state,
    send, 
    ...state.context
  };
}

const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true; 



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




