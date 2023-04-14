import React from 'react';
import {
  styled,
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  IconButton,
  Stack,
  Card,
  Badge,
  Drawer,
} from '@mui/material';
import {
  Columns,
  Flex,
  Nowrap,
  Btn,
  TextIcon,
  ConfirmPop,
  IconTextField,
  TinyButton,
  TextPopover,
  Spacer,
  TimerProgress,
  StackedMenuItem
} from '../../../styled';
import ReactMarkdown from 'react-markdown';
import Login from '../Login/Login';
import ProfilePhotoForm from '../ProfilePhotoForm/ProfilePhotoForm';
import EngineMenu from '../EngineMenu/EngineMenu';
import { AuthContext } from '../../../machines';
 

const FOOTER_OFFSET = 40;

/** 
The QuestionList renders a list of past questions and provides options for configuring the chat interface. 
The component receives two props, handler and handleChange, and is defined as a function that returns JSX.

The handler prop is an object that contains information about the state of the chat interface, while the handleChange prop is a function that 
is used to update the state of the component. The handler object has several properties that are used to render the component, including state, answers, 
sessions, demoLanguages, lang_code, and silent.

Inside the component function, several variables are defined using destructuring and the React.useContext hook to access the AuthContext. 
The disabled variable is set to true if the chat interface is not in a state that allows for a new response. The currentLang variable is set to the current 
language being used for spoken responses.

The component renders a header with a title and a button for starting a new chat. It then renders a list of past questions using the priorQuestions variable, 
and provides the option to clear individual conversations. The component also provides a sidebar menu with options for clearing all conversations, 
changing the language used for spoken responses, and logging in/out of the chat interface.

The QuestionList component is a complex component that relies on several internal variables and external state. Its purpose is to provide a user 
interface for interacting with a chatbot and managing past conversations.
 */
const QuestionList = ({ handler, handleChange }) => {
  const disabled = !handler.state.matches('request.response');
  const { authenticator } = React.useContext(AuthContext);
  const { demoLanguages, lang_code } = handler;
  const currentLang = Object.keys(demoLanguages).find(
    (lang) => demoLanguages[lang] === lang_code
  );
  
  // const renderers = {
  //   code: CodeBlock,
  // };

  const priorQuestions = Object.keys(handler.sessions);
  const firstQuestion = !handler.answers.length
    ? null
    : handler.answers[handler.answers.length - 1].question;

  return (
    <>
      <Flex sx={{ m: (theme) => theme.spacing(2, 1) }}>
        <Badge badgeContent="+" color="warning">
          <Nowrap variant="h6" bold>
            GoatGPT
          </Nowrap>
        </Badge>
        <Spacer />
        <Btn
          size="small"
          startIcon={<TextIcon icon="Add" />}
          variant="outlined"
          disabled={disabled}
          onClick={() => handler.send('QUIT')}
        >
          new chat
        </Btn>
      </Flex>
{/* [{authenticator.user?.attributes.locale}] */}
      <Box
        sx={{
          p: (theme) => theme.spacing(0, 1),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'calc(100% - 60px)',
          // border: 1,
          // borderColor: 'divider' ,
          mt: 2,
        }}
      >
        <Box>
          {!!handler.answers.length && (
            <Bar active>
              <Nowrap>{firstQuestion}</Nowrap>
              <TinyButton icon="BorderColor" />

              <ConfirmPop
              
              message="Are you are you want to remove this conversation?"
              label="Confirm clear"
              okayText="delete"
              onChange={(ok) => !!ok && handler.send({
                type: 'DROP',
                question: firstQuestion
              })}  
              >

              <TinyButton icon="Delete" />
              </ConfirmPop>
            </Bar>
          )}

          {priorQuestions
            .filter((query) => query !== firstQuestion)
            .map((query) => (
              <Bar
                onClick={() => {
                  handler.send({
                    type: 'RESTORE',
                    answers: handler.sessions[query],
                  });
                }}
              >
                <TinyButton icon="Chat" />
                <Nowrap muted hover>
                  {query}
                </Nowrap>
              </Bar>
            ))}
        </Box>

        {/* sidebar options menu */}
        <Stack>
          {/* clear conversations fires CLEAR event  */}
          {!!priorQuestions.length && <ConfirmPop 
              message="Are you are you want to clear all your conversations?"
              label="Confirm clear"
              okayText="Clear conversations"
              onChange={(ok) => !!ok && handler.send('CLEAR')}
            >
          <Bar>
            <TinyButton icon="Delete" />
            <Nowrap hover>Clear conversations</Nowrap>
          </Bar>
          </ConfirmPop>}
          {/* voice language settings */}
          <Bar>
            <TinyButton
              color={handler.silent ? 'inherit' : 'error'}
              icon={!handler.silent ? 'RecordVoiceOver' : 'VoiceOverOff'}
            />
            <Nowrap
              muted={!!handler.silent}
              onClick={() => handleChange('silent', !handler.silent)}
              hover
            >
              Use <b>{currentLang}</b> voice
            </Nowrap>
            <Spacer />
            <TextPopover
              name="lang_code"
              description="Select a language for spoken responses"
              label="Choose language"
              onChange={(e) => {
                handleChange('lang_code', e.target.value)
                authenticator.setLocale(e.target.value);
              }}
              value={handler.lang_code}
              options={Object.keys(handler.demoLanguages).map((label) => ({
                value: handler.demoLanguages[label],
                label,
              }))}
            >
              <TinyButton disabled={handler.silent} icon="Settings" />
            </TextPopover>
          </Bar>

          {/* log in/out menu   */}
          <Login>
            <Bar sx={{ mb: 4 }}>
              <TinyButton icon="Lock" />
              <Nowrap hover>Sign {!!handler.user ? 'Out' : 'In'}</Nowrap>
            </Bar>
          </Login>
        </Stack>
      </Box>
    </>
  );
};

/**
A styled component that renders a Flex component with additional styling.
@component
@param {Object} props - The props object.
@param {boolean} [props.active] - Determines if the component is active.
@param {number} [props.spacing=1] - The spacing between child elements.
@returns {JSX.Element} - A Flex component with additional styling.
@example
<Bar active spacing={2}>
<ChildComponent />
</Bar>
/ const Bar = styled((props) => <Flex {...props} spacing={1} />)( */
const Bar = styled((props) => <Flex {...props} spacing={1} />)(
  ({ theme, active }) => ({
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1),
    borderRadius: '.25rem',
    backgroundColor: !active ? 'transparent' : theme.palette.grey[300],
    maxWidth: '19vw',
    [theme.breakpoints.down('md')]: {
      maxWidth: '75vw',
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  })
);

/**
A styled component for rendering a question with specific typography styling.
@param {Object} props - The props object for the component.
@returns {JSX.Element} - The question component.
*/
const Question = styled('p')(({ theme }) => ({
  fontSize: '0.9rem',
  padding: 0,
  margin: 0,
  fontWeight: 600,
}));

/** 
A styled component for rendering a layout with no margin.
@param {Object} props - The props object for the component.
@returns {JSX.Element} - The layout component.
*/
const Layout = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0),
}));


/**
A styled component for displaying answers.
@param {Object} props - The props object.
@param {Object} props.theme - The theme object.
@param {boolean} props.empty - A boolean indicating whether the Answers component is empty or not.
@returns {JSX.Element} - A React JSX element representing the Answers component.
@example
<Answers theme={theme} empty={true}>
// Add child components here
</Answers>
*/
const Answers = styled(Box)(({ theme, empty }) => ({
  backgroundColor: theme.palette.grey[100],
  height: `calc(100%)`,
  padding: theme.spacing(1),
  width: 'calc(80vw -  16px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: empty ? 'center' : 'flex-start',
  justifyContent: empty ? 'flex-start' : 'flex-start',
  paddingTop: empty ? '2vh' : 0,

  [theme.breakpoints.down('md')]: {
    width: 'calc(100vw)',
  },
}));

/**
A styled component for rendering an option in a selection list.
@param {Object} props - The props object for the component.
@param {boolean} props.active - Determines if the option is currently active or not.
@param {string} props.color - The color of the option.
@param {boolean} props.disabled - Determines if the option is currently disabled or not.
@returns {JSX.Element} - The option component.
*/
const Option = styled(Card)(({ theme, active, color, disabled }) => ({
  padding: theme.spacing(1),
  width: 200,
  height: 80,
  cursor: disabled ? "default" : 'pointer',
  color: theme.palette.common.white,
  backgroundColor: disabled 
    ? theme.palette.grey[400] 
    : active
    ? theme.palette[color].dark
    : theme.palette[color].light,
  outlineOffset: 1,
  outline: disabled ? theme.palette.grey[400] : active ? `solid 2px ${theme.palette[color].dark}` : 'none',
  '&:hover': {
    outline: disabled ? theme.palette.grey[400] : `solid 2px ${theme.palette[color].dark}`,
    backgroundColor: disabled 
        ? theme.palette.grey[400] 
        : theme.palette[color].dark,
  },
}));

/**
A styled component for rendering a chat window with adjustable column widths.
@param {Object} props - The props object for the component.
@param {boolean} props.small - Determines if the chat window should have a single column or multiple columns.
@returns {JSX.Element} - The chat window component.
*/
const ChatWindow = styled((props) => <Columns {...props}  columns={props.small ? '1fr' : '20vw 1fr'}/>)(
  ({ theme}) => ({
    alignItems: 'flex-start', 
    height: `calc(100svh - ${FOOTER_OFFSET}px)`,
    backgroundColor: theme.palette.common.white
  }))

/**
A styled component for rendering a sidebar with a specific height, background color, and padding.
@param {Object} props - The props object for the component.
@returns {JSX.Element} - The sidebar component.
*/
const Sidebar = styled(Box)(
  ({ theme}) => ({
    height: `calc(100svh - 12px - ${FOOTER_OFFSET}px)`,
    backgroundColor: theme.palette.grey[100],
    paddingTop: theme.spacing(1),
  }));
 

/**
 * A styled component that renders a workspace element.
 *
 * @constant
 * @type {import('@material-ui/core').StyledComponentProps<'div'>}
 *
 * @param {Object} props - The props object.
 * @param {Object} props.theme - The theme object containing style-related properties.
 * @returns {Object} An object containing the styles for the Workspace component.
 */
const Workspace = styled(Box)(({ theme }) => ({
  height: `calc(100svh - 100px - ${FOOTER_OFFSET}px)`,
  overflow: 'auto'
}));


/**
This code defines a React functional component ChatPane that renders a chat window where users can interact with a GPT-based chatbot. 
The component receives a single prop handler, which is an object containing the current state of the chatbot and functions to interact with it.

The component consists of a Layout styled component, a ChatWindow component with two children: a Sidebar (optional) and a Box with the main chat 
interface. The Sidebar component contains a QuestionList component that displays a list of previous questions and allows the user to clear the chat 
history or select a different voice language.

The main chat interface is composed of a form with an IconTextField component and a ProfilePhotoForm component for the user's profile photo. 
The IconTextField has an input field for the user to type or speak their question, a dropdown menu to select the response type (text or image), 
and a button to send the question or start/stop speech recognition. The Box component also contains a Workspace component that displays the chatbot's responses.

The Workspace component has two states: the initial state when no responses have been received, and the state when the chatbot has provided a 
response. In the initial state, the component displays a welcome message with options to select the response type and the chatbot's precision settings. 
When the chatbot has provided a response, the component displays the user's question, the chatbot's response, and buttons to edit or regenerate the response.

The component also contains helper functions to handle changes in the component's state and regenerate responses to previous questions.
 */
const ChatPane = ({ handler }) => {
  const disabled = !handler.state.matches('request.response');
  const listening = handler.state.matches('listening');
  const busy = handler.state.matches('request.query'); 

  const { isMobileViewPort, tempProps, typeProps, temperatureIndex, responseType } = handler;
  const typeProp = typeProps.find(type => type.value === responseType)
  const tempProp = tempProps[temperatureIndex];

  const handleChange = (key, value) => {
    handler.send({
      type: 'CHANGE',
      key,
      value,
    });
  };

  const regererate = (index) => {
    const { question, responseType } = handler.answers[index];

    !!responseType && handleChange('responseType', responseType);

    handleChange('requestText', question);
    handleChange('editing', null);
    handler.send({
      type: 'TEXT',
      index,
    });
  };

  const timerLimit = Math.pow (handler.max_tokens - 6, 3)

  return (
    <Layout>
      <ChatWindow small={isMobileViewPort}>
        {!isMobileViewPort && (
          <Sidebar>
            <QuestionList handleChange={handleChange} handler={handler} />
          </Sidebar>
        )}

        <Box>
          <form
            style={{ width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault();
              handler.send('TEXT');
            }}
          >
            <Flex fullWidth sx={{ p: 1, alignItems: 'flex-start' }} spacing={1}>
              {isMobileViewPort && (
                <IconButton
                  onClick={() =>
                    handleChange('sidebarOpen', !handler.sidebarOpen)
                  }
                >
                  <TextIcon icon="Menu" />
                </IconButton>
              )}
              <IconTextField
                sx={
                  isMobileViewPort
                    ? {
                        width: `calc(100vw - ${
                          !!handler.user ? '128px' : '64px'
                        })`,
                      }
                    : {}
                }
                helperText={
                  handler.state.matches('speak')
                    ? 'Translating...'
                    : handler.responseType === 'image'
                    ? "Auto-generate an image by describing it"
                    : isMobileViewPort
                    ? 'ChatGPT may produce inaccurate information'
                    : 'ChatGPT may produce inaccurate information about people, places, or facts'
                }
                disabled={busy}
                googlish
                startIcon={
                  <EngineMenu full handler={handler}>
                    <IconButton>
                      <TextIcon
                        icon={
                          handler.responseType === 'image'
                            ? 'Photo'
                            : 'TextFields'
                        }
                      />
                    </IconButton>
                  </EngineMenu>
                }
                endIcon={
                  busy ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Flex spacing={1}>
                      <IconButton
                          disabled={!handler.requestText?.length}
                          onClick={() => handler.send('TEXT')}>
                        <TextIcon
                          icon={'Telegram'}
                        />
                      </IconButton>

                      <IconButton>
                        {' '}
                        <TextIcon
                          disabled={disabled}
                          icon={listening ? 'MicOff' : 'Mic'}
                          onClick={() => handler.send('ASK')}
                        />
                      </IconButton> 

                    </Flex>
                  )
                }
                fullWidth={!isMobileViewPort}
                value={handler.requestText}
                placeholder={
                  handler.responseType === 'image'
                    ? 'Describe an image and I will make it'
                    : 'Type or speak a question'
                }
                name="requestText"
                onChange={(e) =>
                  handler.send({
                    type: 'CHANGE',
                    key: e.target.name,
                    value: e.target.value,
                  })
                }
              />

              <ProfilePhotoForm />
            </Flex>
          </form>

          <Workspace>
            {/* something to look at while the bot is thinking */}
            {handler.state.matches('request.query') && (
              <TimerProgress component={LinearProgress} limit={timerLimit} auto />
            )}

            {/* MAIN WORKSPACE */}
            {
              <Answers empty={!handler.answers.length}>
                {/* show home screen when no answers present */}
                {!handler.state.matches('request.query') && !handler.answers.length && (
                  <>
                    <Stack sx={{ m: 3 }}>
                      <Nowrap variant="h4">
                        GoatGPT{' '}
                        <Btn
                          variant="contained"
                          endIcon={<TextIcon icon="Add" />}
                          color="warning"
                        >
                          plus
                        </Btn>
                      </Nowrap>
                      <Nowrap sx={{ letterSpacing: 2.2 }} small muted>
                        The <b>G</b>reatest GPT <b>O</b>f <b>A</b>ll <b>T</b>ime
                      </Nowrap>
                    </Stack>

                    <Stack sx={{ m: 3}}>
                    <Nowrap error={listening} bold small muted>
                      {listening ? "I'm listening..." : "Ask me anything"}
                    </Nowrap>
                    <IconButton  
                      onClick={() => handler.send('ASK')} 
                      sx={{
                        width: 100,
                        height: 100,
                        border: 2,
                     
                        backgroundColor: theme => listening ? theme.palette.primary.dark : theme.palette.common.white,
                        borderColor: listening ? 'primary' : 'divider'
                      }}>

                      <TextIcon
                        sx={{
                          color: !listening ? 'primary'  : 'white'
                        }}
                        icon={listening ? 'MicOff' : 'Mic'}  />

                    </IconButton>
                    </Stack>

                    {!isMobileViewPort && (
             
                    <>
                    
                      <Nowrap
                        sx={{ m: (theme) => theme.spacing(3, 0, 1, 0) }}
                        small
                        muted
                      >
                        ChatGPT precision settings
                      </Nowrap>


                      <Stack
                        direction={isMobileViewPort ? 'column' : 'row'}
                        wrap="wrap"
                        spacing={1}
                        sx={{ mb: 2 }}
                      >
                        {handler.tempProps.map((prop, i) => (
                          <Option
                            color={prop.color}
                            onClick={(e) => responseType === 'text' && handleChange('temperatureIndex', i)}
                            active={i === handler.temperatureIndex}
                            key={prop.value}
                            disabled={responseType !== 'text'}
                          >
                            <Flex spacing={1}>
                              <TextIcon icon={prop.icon} />
                              <Nowrap hover bold={i === handler.temperatureIndex}>
                                {prop.label}
                              </Nowrap>
                            </Flex>
                            <Nowrap
                              hover
                              bold={i === handler.temperatureIndex}
                              small
                              wrap
                            >
                              {prop.caption}
                            </Nowrap>
                          </Option>
                        ))}
                      </Stack> 

                    </>
         
                    )}

                      <Nowrap  sx={{mt: 3}} small muted>
                        Precision settings
                      </Nowrap>

                    {!!isMobileViewPort && (
                      <>
          
                      <EngineMenu engine handler={handler}>
                        <Card sx={{ p: 1 }}>
                          <StackedMenuItem bold {...tempProp}>
                            {tempProp.label}
                          </StackedMenuItem>
                        </Card>
                        </EngineMenu>

                        <Nowrap  sx={{mt: 3}} small muted>
                        Response mode
                      </Nowrap>
                      
                      </>
                    )}


                    <EngineMenu handler={handler}>
                      <Card sx={{ p: 1 }}>
                        <StackedMenuItem bold {...typeProp}>
                          {typeProp.label}
                        </StackedMenuItem>
                      </Card>
                      </EngineMenu>

                    {/* {JSON.stringify(typeProp)} */}

                  </>
                )}

                {/* answers when found  */}
                {!!handler.answers.length &&
                  handler.answers.map((response, i) => (
                    <>

                    {/* question text  */}
                      <Flex
                        wrap="wrap"
                        spacing={1}
                        sx={{
                          p: 2,
                          backgroundColor: (theme) => theme.palette.grey[300],
                          width: '100%',
                        }}
                      >


                        <Question wrap small>
                      
                          {response.id !== handler.editing ? (
                            <>{response.question}</>
                          ) : (
                            <IconTextField
                              endIcon={
                                <IconButton onClick={() => regererate(i)}>
                                  <TextIcon icon="Telegram" />
                                </IconButton>
                              }
                              googlish
                              sx={{ minWidth: '50vw' }}
                              fullWidth
                              size="small"
                              onChange={(e) => {
                                handleChange(
                                  'answers',
                                  handler.answers.map((res) =>
                                    res.id === response.id
                                      ? {
                                          ...res,
                                          question: e.target.value,
                                        }
                                      : res
                                  )
                                );
                              }}
                              value={response.question}
                            />
                          )}
                        </Question>


                        <Spacer />
                        {/* {!isNaN(response.responseTime) && (
                          <Nowrap tiny muted>
                            {response.responseTime / 1000}s
                          </Nowrap>
                        )} */}
                        <TinyButton icon="CopyAll" onClick={() => handler.clipboard.copy(response.answer)} />
                        <TinyButton 
                          disabled={!handler.state.can('TEXT')}
                          icon="Sync" onClick={() => regererate(i)} />
                        <TinyButton
                          disabled={!handler.state.can('TEXT')}
                          icon={
                            response.id !== handler.editing
                              ? 'BorderColor'
                              : 'Close'
                          }
                          onClick={() =>
                            handleChange(
                              'editing',
                              !!handler.editing ? null : response.id
                            )
                          }
                        />
                      </Flex>

                    {/* answer text  */}
                      <ReactMarkdown key={i}>{response.answer}</ReactMarkdown>

                      {response.finish_reason === 'length' && <Alert sx={{ m: 1, width: '98%' }} severity="warning">
                          <Stack> 
                            <Nowrap hover onClick={() => regererate(i)}
                              bold small error>Response is incomplete. </Nowrap> 
                            <Nowrap small muted>Allocate more tokens and try again</Nowrap>
                          </Stack>
                        </Alert> 
                        } 
                    </>
                  ))}
              </Answers>
            } 
          </Workspace>
        </Box>
      </ChatWindow>
      <Drawer
        open={handler.sidebarOpen && isMobileViewPort}
        onClose={() => handleChange('sidebarOpen', false)}
        anchor="left"
      >
        <QuestionList handleChange={handleChange} handler={handler} />
      </Drawer>
    </Layout>
  );
};
ChatPane.defaultProps = {};
export default ChatPane;
