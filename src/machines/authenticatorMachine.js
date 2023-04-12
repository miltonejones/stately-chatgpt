import React from 'react';
import { Auth } from 'aws-amplify';
import { createMachine, assign } from 'xstate';
import { useMachine } from "@xstate/react";

export const AuthContext = React.createContext();

// add machine code
const authenticatorMachine = createMachine({
  id: "auth",
  initial: "start",
  states: {
    start: {
      initial: "authenticate",
      states: { 
        authenticate: {
          invoke: {
            src: "authenticateUser",
            onDone: [
              {
                target: "#auth.signed_in",
                actions: "assignAuth",
              },
            ],
            onError: [
              {
                target: "#auth.signing_in",
              },
            ],
          },
        },
      },
    },
    signed_in: {
      description: "Successful login adds the authenticated user to scope",
      initial: "idle",
      states: {
        idle: {
          description: "Successful login adds the authenticated user to scope",
          invoke: {
            src: "emitUser",
          },
          on: {
            UPDATE: {
              target: "change",
              actions: "assignProps",
            },
          },
        },
        change: {
          description: "Update user attribute",
          initial: "update",
          states: {
            update: {
              invoke: {
                src: "updateUser",
                onDone: [
                  {
                    target: "refresh",
                  },
                ],
              },
            },
            refresh: {
              invoke: {
                src: "authenticateUser",
                onDone: [
                  {
                    target: "#auth.signed_in.idle",
                    actions: "assignAuth",
                  },
                ],
              },
            },
          },
        },
      },
      on: {
        SIGNOUT: {
          target: "signing_out",
        },
      },
    },
    signing_in: {
      initial: "initiate",
      states: {
        initiate: {
          description: "Emit user info to calling components",
          invoke: {
            src: "emitUser",
            onDone: [
              {
                target: "form_entry",
              },
            ],
          },
        },
        form_entry: {
          description: "Shows the login form with option to sign up or reset password",
          meta: {
            label: "Please sign in",
            button: "Sign In",
            username: "Username",
            password: "Password",
            ok: "SIGNIN"
          },
          on: {
            SIGNUP: {
              target: "#auth.signing_up",
            },
            FORGOT: {
              target: "name_entry",
            },
          },
        },
        name_entry: {
          description: "Provide user name for password reset process",
          meta: {
            label: "Enter your username",
            button: "Request Password Reset",
            username: "Username",
            ok: "SUBMIT"
          },
          on: {
            SUBMIT: {
              target: "send_forgot",
            },
            CANCEL: {
              target: "form_entry",
            },
          },
        },
        send_forgot: {
          invoke: {
            src: "forgotRequest",
            onDone: [
              {
                target: "validate",
              },
            ],
            onError: [
              {
                target: "forgot_error",
                actions: "assignProblem",
              },
            ],
          },
        },
        validate: {
          description: "User enters validation code received in email",
          meta: {
            label: "Enter validation code",
            button: "Validate",
            verificationCode: "Validation Code",
            ok: "UPDATE",
          },
          on: {
            UPDATE: {
              target: "change_pass",
            },
            CANCEL: {
              target: "name_entry",
            },
          },
        },
        change_pass: {
          invoke: {
            src: "updateRequest",
            onDone: [
              {
                target: "initiate",
              },
            ],
            onError: [
              {
                target: "change_error",
                actions: "assignProblem",
              },
            ],
          },
        },
        change_error: {
          on: {
            RETRY: {
              target: "validate",
            },
          },
        },
        forgot_error: {
          on: {
            RETRY: {
              target: "name_entry",
            },
          },
        },
      },
      on: {
        SIGNIN: {
          target: "send_signin",
        },
      },
    },
    signing_up: {
      initial: "config",
      states: {
        config: {
          description: "User enters sign in details for new account",
          meta: {
            label: "Create a new account",
            button: "Create Account",
            username: "Username",
            password: "Password",
            email: "Email Address",
            ok: "SEND"
          },
          on: {
            SEND: {
              target: "send_signup",
            },
          },
        },
        send_signup: {
          invoke: {
            src: "signUp",
            onDone: [
              {
                target: "confirming",
              },
            ],
            onError: [
              {
                target: "error",
                actions: "assignProblem",
              },
            ],
          },
        },
        confirming: {
          meta: {
            label: "Enter access code",
            button: "Confirm Account",
            verificationCode: "Access Code",
            ok: "CONFIRM"
          },
          on: {
            CONFIRM: {
              target: "send_confirm",
            },
          },
        },
        send_confirm: {
          invoke: {
            src: "confirmSignUp",
            onDone: [
              {
                target: "#auth.signing_in",
              },
            ],
            onError: [
              {
                target: "error",
                actions: "assignProblem",
              },
            ],
          },
        },
        error: {
          on: {
            RETRY: {
              target: "config",
              actions: "clearProblems",
            },
            CANCEL: {
              target: "#auth.signing_in",
              actions: "clearProblems",
            },
          },
        },
      },
      on: {
        CANCEL: {
          target: "signing_in",
        },
      },
    },
    send_signin: {
      initial: "login",
      states: {
        login: {
          description: "send login credentials to amplify",
          invoke: {
            src: "signIn",
            onDone: [
              {
                target: "#auth.signed_in",
                actions: "assignAuth",
              },
            ],
            onError: [
              {
                target: "error",
                actions: "assignProblem",
              },
            ],
          },
        },
        error: {
          on: {
            RETRY: {
              target: "#auth.signing_in",
              actions: "clearProblems",
            },
          },
        },
      
      },
    },
    signing_out: {
      invoke: {
        src: "signOut",
        onDone: [
          {
            target: "signing_in",
            actions: "clearAuth",
          },
        ],
      },
    },
  },
  on: {
    CHANGE: {
      actions: "applyChanges",
    },
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
},
{
  
guards: {
  // Define a containsUser guard that returns true if the user property in the context is truthy
  containsUser: (context) => !!context.user,
  // Define a validUser guard that returns true if the valid property in the context is truthy
  validUser: (context) => !!context.valid,
  // Define a successAuth guard that returns true if the username property in the data of the event is truthy
  successAuth: (_, event) => !!event.data.username
},

  actions: {
    // Define an assignAuth action that assigns the user property in the context to the data property of the event
    assignAuth: assign((_, event) => ({
      user: event.data, 
    })),
    // Define a clearAuth action that sets the user property in the context to null
    clearAuth: assign((_, event) => ({
      user: null
    })),
    // Define an assignProblem action that assigns the error and stack properties in the context to the message and stack properties of the event's data, respectively
    assignProblem: assign((_, event) => ({
      error: event.data.message,
      stack: event.data.stack
    })),
    // Define a clearProblems action that sets the error and stack properties in the context to null
    clearProblems: assign((context, event) => {
      return {
        error: null,
        stack: null,
      };
    }),
    // Define an assignProps action that assigns the changes property in the context to an object with a key equal to the event's key and a value equal to the event's value
    assignProps: assign((_, event) => ({
      changes: {
        [event.key]: event.value
      }
    })),
    // Define an applyChanges action that assigns a property in the context with a key equal to the event's key and a value equal to the event's value
    applyChanges: assign((_, event) => ({
      [event.key]: event.value
    })),
  }


});

// Define a custom hook called useAuthenticator that creates a state machine for managing user authentication
export const useAuthenticator = (onSign) => {
  // Use the useMachine hook from XState to create a state machine called authenticatorMachine and its state and send functions
  const [state, send] = useMachine(authenticatorMachine, {
    services: {
      // Define an authenticateUser service that scrolls to the top of the window and returns the current authenticated user
      authenticateUser: async() => {  
        window.scrollTo(0, 1);
        return await Auth.currentAuthenticatedUser(); 
      },
      // Define an emitUser service that calls the onSign callback function with the user object in the context
      emitUser: async(context) => { 
        return onSign && onSign(context.user)
      },
      // Define a signOut service that signs out the current user
      signOut: async(context) => { 
        return await Auth.signOut(); 
      },
      // Define an updateUser service that updates the user attributes with the changes in the context
      updateUser: async(context) => { 
        return await Auth.updateUserAttributes(context.user, context.changes); 
      },
      // Define a forgotRequest service that sends a forgot password request for the given username
      forgotRequest: async(context) => {
        const { username } = context;
        return await Auth.forgotPassword(username)
      },
      // Define an updateRequest service that submits a forgot password verification code and new password for the given username
      updateRequest: async(context) => {
        const { username, verificationCode, password } = context;
        return await Auth.forgotPasswordSubmit(username, verificationCode, password); 
      },
      // Define a signIn service that signs in the user with the given username and password
      signIn: async(context) => {
        const { username, password } = context;
        return await Auth.signIn(username, password);   
      },
      // Define a confirmSignUp service that confirms the sign up for the given username and verification code
      confirmSignUp: async(context) => {
        const { username, verificationCode } = context;
        return await Auth.confirmSignUp(username, verificationCode); 
      },
      // Define a signUp service that signs up the user with the given username, password, and email
      signUp: async(context) => {
        const { username, password, email} = context;
        return await Auth.signUp({
          username,
          password,
          attributes: {
            email,
          }});
      }
    },
  }); 

  // Define two functions for updating the state machine's picture and locale values
  const setPhoto = value => {
    send({
      type: 'UPDATE',
      key: 'picture',
      value
    })
  }
  const setLocale = value => {
    send({
      type: 'UPDATE',
      key: 'locale',
      value
    })
  }
  
  // Return an object containing the state machine's state and send functions, as well as the setPhoto and setLocale functions
  // Also include a diagnosticProps object for debugging purposes, which contains the authenticatorMachine, state, and send functions
  // Finally, include the context object's values as properties of the returned object
  return {
    state,
    send, 
    setPhoto,
    setLocale,
    diagnosticProps: {
      ...authenticatorMachine,
      state,
      send,
    },
    ...state.context
  };
}
