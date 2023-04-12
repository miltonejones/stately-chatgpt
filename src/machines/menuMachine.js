
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";

// add machine code
const menuMachine = createMachine({
  id: 'simple_menu',
  description:
  'The simple menu machine manages any modal object that can be open or closed. When the modal is open the menu context contains a data object that can be edited and returned as a value in the menuClicked service.',

  initial: 'closed',
  context: {
    data: {}
  },
  states: {
    closed: {
      description: 'Menu is closed and idle.',
      on: {
        open: {
          target: 'opened',
          actions: 'assignOpen',
          description:
            'Set menu open to true and assign any data to the menu context.',
        },
      },
    },
    opened: {
      description: 'Menu is open and active.',
      initial: 'ready',
      states: {
        ready: {
          description: 'Menu is open and ready for user interaction.',
          on: {
            close: [
              {
                target: '#simple_menu.closing',
                cond: 'isClean',
                actions: 'assignClose',
                description:
                  'When there are no unsaved changes go directly to closing state.',
              },
              {
                target: 'confirm',
                description:
                  'When there are unsaved changes redirect to confirm state.',
              },
            ],
          },
        },
        confirm: {
          description: 'Allow user to cancel close and return to open menu.',
          on: {
            cancel: {
              target: 'ready',
              description:
                'Return to ready state after user cancels close request.',
            },
            ok: {
              target: '#simple_menu.closing',
              actions: 'assignClose',
              description: 'Close menu after user confirmation.',
            },
          },
        },
      },
      on: {
        change: {
          actions: 'applyChanges',
          description:
            'Apply changes to the data object being edited in the open modal',
        },
        prop: {
          actions: 'assignProp',
          description: 'Apply changes to the properties of the modal context.',
        },
      },
    },
    closing: {
      description: 'Emit event to notify caller of menu state.',
      invoke: {
        src: 'menuClicked',
        onDone: [
          {
            target: 'closed',
            description: 'Return menu to closed idle state.',
          },
        ],
      },
    },
  },
},
{
  guards: {
    isClean: (context, event) => !context.dirty || !!event.value
  },
  actions: {
    assignClose: assign((_, event) => ({
      anchorEl: null,
      value: event.value,
      data: null,
      open: false
    })),
    assignOpen: assign((_, event) => ({
      dirty: false,
      anchorEl: event.anchorEl,
      data: event.data,
      open: true
    })),
    applyChanges: assign((context, event) => ({
      dirty: 1,
      data: {
        ...context.data,
        [event.key]: event.value
      }
    })),
    assignProp: assign((_, event) => ({
      [event.key]: event.value
    })),
  }
});


// Define the useMenu hook that takes a onChange callback as input
export const useMenu = (onChange) => {
  // Destructure the current state and the send function from the menuMachine state machine
  const [state, send] = useMachine(menuMachine, {
    // Define a service for the menuClicked event
    services: {
      menuClicked: async (context, event) => {
        // Call the onChange callback if it exists
        onChange && onChange(event.value);
      },
    },
  });

  // Destructure the anchorEl property from the state context
  const { anchorEl } = state.context;

  // Define a function to close the menu and pass a value to the state machine
  const handleClose = (value) => () =>
    send({
      type: "close",
      value,
    });

  // Define a function to open the menu and pass an anchor element and some data to the state machine
  const handleClick = (event, data) => {
    send({
      type: "open",
      anchorEl: event?.currentTarget,
      data,
    });
  };

  // Create a diagnosticProps object that contains the menuMachine, state, and send properties
  const diagnosticProps = {
    ...menuMachine,
    state,
    send,
  };

  // Return an object that contains the state context, state, send, anchorEl, handleClick, handleClose, and diagnosticProps properties
  return {
    ...state.context,
    state,
    send,
    anchorEl,
    handleClick,
    handleClose,
    diagnosticProps,
  };
};
