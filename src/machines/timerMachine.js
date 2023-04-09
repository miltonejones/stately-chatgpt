
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";

// add machine code
const timerMachine = createMachine({
  id: "timer",
  description: "Manages basic timer functions for components needing timed effects.",
  initial: "ready",
  states: {
    ready: {
      description: "Timer is idle unless AUTO is set to true, otherwise wait for START event.",
      initial: "load",
      states: {
        load: {
          description: "Load settings from defined properties.",
          invoke: {
            src: "loadSettings",
            onDone: [
              {
                target: "decide",
                actions: "assignSettings",
                description: "Assign settings to context for the counter.",
              },
            ],
          },
        },
        decide: {
          description: "When AUTO is not true, hold in the decide state until START is called.",
          after: {
            1: {
              target: "#timer.running",
              cond: "isAuto",
              description: "When AUTO is true start running immediately.",
            }
          },
          on: {
            START: {
              target: "#timer.running",
              description: "Start the timer",
            },
          },
        },
      }, 
    },
    running: {
      description: "Running state cycles between states until counter reaches zero.",
      initial: "tick",
      states: {
        tick: {
          entry: "decrementTick",
          after: {
            "100": {
              target: "#timer.running.tock",
              actions: [],
              internal: false,
            },
          },
        },
        tock: {
          entry: "decrementTick",
          after: {
            "100": [
              {
                target: "#timer.running.tick",
                cond: "positiveTick",
                description: "When counter is greater than zero return to TICK state.",
                actions: [],
                internal: false,
              },
              {
                target: "#timer.done",
                actions: [],
                description: "When counter reaches zero move to DONE state.",
                internal: false,
              },
            ],
          },
        },
      },
    },
    done: {
      description: "Timer is done and accepts no new events.",
      type: "final",
    },
  },
  context: {
    counter: 0,
    auto: false,
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
},
{
  guards: {
    isAuto: context => !!context.auto,
    positiveTick: context => context.counter > 0
  }, 
  actions: {
    decrementTick: assign((context) => ({ 
      counter: context.counter - .1,
      progress: 100 * (1 - (context.counter / context.limit))
    })),
    assignSettings: assign((_, event) => ({
      limit:  event.data.limit,
      counter: event.data.limit,
      auto: event.data.auto
    }))
  }
}
);


export const useTimer = (settings = {
  limit: 0,
  auto: false
}) => {
  const [state, send] = useMachine(timerMachine, {
    services: { 
      loadSettings: async() => settings 
    },
  }); 

  const diagnosticProps = {
    ...timerMachine,
    state,
    send,
  };

  return {
    state,
    send, 
    diagnosticProps,
    ...state.context
  };
} 