
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";

// add machine code
const chatMachine = createMachine({
  id: "chat_gpt",
  initial: "idle",
  states: {
    idle: {
      description: 'Machine waits in idle request accepting no requests',
      entry: 'resetSession',
      on: {
        ASK: {
          target: 'listening',
        },
        TEXT: {
          target: '#chat_gpt.request.query',
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
          target: 'idle',
          actions: 'commitSession',
          description: 'Save session to session log',
        },
      },
    },
  },
  on: {
    CHANGE: {
      description: 'Update state context property values.',
      actions: 'applyChanges'
    },
  },
  context: {
    sessions: {}, 
    answers: []
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
    applyChanges: assign((context, event) => {
      return {
        [event.key]: event.value
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
      stopListening: async() => {
        return recognition.stop();
      },
      startListening: async() => {
        return recognition.start();
      },
      sendChatRequest: async(context) => {
        const { answers } = context;
        const convo = answers.map(q => ({"role": "user", "content": q.question}))
          .concat({"role": "user", "content": context.requestText})
        return await generateText (convo)
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



const generateText = async (messages) => {
  const requestOptions = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.7, 
      model: "gpt-3.5-turbo",
      max_tokens: 1024, 
    }),
  };
  const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions );
  const json = await response.json();
 
  return json;
};




