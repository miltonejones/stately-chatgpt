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
    containsUser: (context) => !!context.user,
    validUser: (context) => !!context.valid,
    successAuth: (_, event) => !!event.data.username
  },

  actions: {

    assignAuth: assign((_, event) => ({
      user: event.data, 
    })),
    clearAuth: assign((_, event) => ({
      user: null
    })),
    assignProblem: assign((_, event) => ({
      error: event.data.message,
      stack: event.data.stack
    })),
    clearProblems: assign((context, event) => {
      return {
        error: null,
        stack: null,
      };
    }),
    assignProps: assign((_, event) => ({
      changes: {
        [event.key]: event.value
      }
    })),
    applyChanges: assign((_, event) => ({
      [event.key]: event.value
    })),
  }

});

export const useAuthenticator = (onSign) => {
  const [state, send] = useMachine(authenticatorMachine, {
    services: {
      authenticateUser: async() => {  
        window.scrollTo(0, 1);
       return await Auth.currentAuthenticatedUser(); 
      },
      emitUser: async(context) => { 
        return onSign && onSign(context.user)
      },
      signOut: async(context) => { 
        return await Auth.signOut(); 
      },
      updateUser: async(context) => { 
        return await Auth.updateUserAttributes(context.user, context.changes); 
      },
      forgotRequest: async(context) => {
        const { username } = context;
        return await Auth.forgotPassword(username)
      },
      updateRequest: async(context) => {
        const { username, verificationCode, password } = context;
        return await Auth.forgotPasswordSubmit(username, verificationCode, password); 
      },
      signIn: async(context) => {
        const { username, password } = context;
        return await Auth.signIn(username, password);   
      },
      confirmSignUp: async(context) => {
        const { username, verificationCode } = context;
        return await Auth.confirmSignUp(username, verificationCode); 
      },
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

  const setPhoto = value => {
    send({
      type: 'UPDATE',
      key: 'picture',
      value
    })
  }
 

  return {
    state,
    send, 
    setPhoto,
    diagnosticProps: {
      ...authenticatorMachine,
      state,
      send,
    },
    ...state.context
  };
}
