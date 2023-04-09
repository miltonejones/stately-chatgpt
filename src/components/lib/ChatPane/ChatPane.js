import React from 'react';
import {
  styled,
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
  IconTextField,
  TinyButton,
  TextPopover,
  Spacer,
  TimerProgress
} from '../../../styled';
import ReactMarkdown from 'react-markdown';
import Login from '../Login/Login';
import ProfilePhotoForm from '../ProfilePhotoForm/ProfilePhotoForm';
// import rehypeHighlight from 'rehype-highlight';
// import Prism from 'prismjs';
// import 'prismjs/themes/prism-tomorrow.css';

// function CodeBlock({ language, value }) {
//   // const prismLanguage = Prism.languages[language];
//   // const highlightedCode = Prism.highlight(value, prismLanguage, language);

//   return (
//     <pre>
//      {value}
//     </pre>
//   );
// }


const QuestionList = ({ handler, handleChange }) => {
  const disabled = !handler.state.matches('request.response'); 
  // const renderers = {
  //   code: CodeBlock,
  // };

  const priorQuestions = Object.keys(handler.sessions);
  const firstQuestion = !handler.answers.length 
    ? null
    : handler.answers[handler.answers.length - 1].question;

    
  return (
   <>


    <Flex sx={{ p: (theme) => theme.spacing(2, 1) }}>
      <Badge badgeContent="+" color="warning">
      <Nowrap variant="h6" bold>GoatGPT</Nowrap>
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
{/* [{JSON.stringify(handler.state.value)}] */}
    <Box sx={{ p: (theme) => theme.spacing(0, 1),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100% - 60px)',
        // border: 1,
        // borderColor: 'divider' ,
        mt: 2,
        }}>
    
      <Box>


      {!!handler.answers.length && (
        <Bar active>
          <Nowrap>{firstQuestion}</Nowrap>
          <TinyButton icon="BorderColor" />
          <TinyButton icon="Close"  onClick={() => handler.send('QUIT')}/>
        </Bar>
      )}

      {priorQuestions
        .filter(query => query !== firstQuestion)
        .map((query) => (
        <Bar>
          <TinyButton icon="Chat" />
          <Nowrap muted hover onClick={() => {
            handler.send({
              type: 'RESTORE',
              answers: handler.sessions[query]
            })
          }}>
            {query}
          </Nowrap>
          
        </Bar>
      ))}


      </Box>

      <Stack>
        <Bar>
          <TinyButton icon="Delete" />
          <Nowrap hover>Clear conversations</Nowrap>
        </Bar>

        <Bar >
            <TinyButton color={handler.silent ? "inherit" : "error"} icon={!handler.silent?"RecordVoiceOver":"VoiceOverOff"} /> 
          <Nowrap muted={!!handler.silent} onClick={() => handleChange('silent', !handler.silent)} hover>Use voice</Nowrap>
          <Spacer />  
          <TextPopover
            name="lang_code"
            description="Select a language for spoken responses"
            label="Choose language"
            onChange={(e) => handleChange('lang_code', e.target.value)}
            value={handler.lang_code}
            options={
              Object.keys(handler.demoLanguages).map(label => ({
                value: handler.demoLanguages[label],
                label
              }))
            }
            >
            <TinyButton disabled={handler.silent} icon="Settings" />
          </TextPopover>
        </Bar>
 
        <Login >
          <Bar sx={{ mb: 4 }}>
            <TinyButton icon="Lock" />
          <Nowrap hover>Sign {!!handler.user ? "Out" : "In"}</Nowrap>
          </Bar>
        </Login>    

      </Stack>

    </Box>
   
   </> 
  )
}

// https://help.openai.com/en/collections/3742473-chatgpt


const Bar = styled((props) => <Flex {...props} spacing={1} />)(
  ({ theme, active }) => ({
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1),
    borderRadius: '.25rem',
    backgroundColor: !active ? 'transparent' : theme.palette.grey[300],
    maxWidth: '19vw',
    [theme.breakpoints.down('md')]: {
      maxWidth: '75vw'
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    }
  })
);

const Question = styled('p')(({ theme }) => ({
  fontSize: '0.9rem',
  padding: 0,
  margin: 0,
  fontWeight: 600,
}));

const Layout = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0),
}));

const Answers = styled(Box)(({ theme, empty }) => ({
  backgroundColor: theme.palette.grey[100],
  height: `100%`, 
  padding: theme.spacing(1),
  width: 'calc(80vw -  16px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: empty ? 'center' : 'flex-start',
  justifyContent: empty ? 'center' : 'flex-start',

  [theme.breakpoints.down('md')]: {
    width: 'calc(100vw -  16px)',
  },

}));

const Option = styled(Card)(({ theme, active, color }) => ({
  padding: theme.spacing(1),
  width: 200,
  height: 100,
  cursor: 'pointer',
  color: theme.palette.common.white,
  backgroundColor: active
    ? theme.palette[color].dark
    : theme.palette[color].light,
  outlineOffset: 1,
  outline: active
    ? `solid 2px ${theme.palette[color].dark}`
    : "none",
  '&:hover': {
    outline: `solid 2px ${theme.palette[color].dark}`,
    backgroundColor: theme.palette[color].dark
  }
}))


const ChatPane = ({ handler }) => {
  const disabled = !handler.state.matches('request.response');
  const listening = handler.state.matches('listening');
  const busy = handler.state.matches('request.query');
  // const renderers = {
  //   code: CodeBlock,
  // };

  const { isMobileViewPort } = handler;

  // const priorQuestions = Object.keys(handler.sessions);
  // const firstQuestion = !handler.answers.length 
  //   ? null
  //   : handler.answers[handler.answers.length - 1].question;

  const handleChange = (key, value) => {
    handler.send({
      type: 'CHANGE',
      key,
      value 
    })
  }

    
  return (
    <Layout>
      <Columns
        sx={{ alignItems: 'flex-start', height: '100vh' }}
        columns={isMobileViewPort ? "1fr" : "20vw 1fr"}
      >
       {!isMobileViewPort && <Box
          sx={{
            height: 'calc(100vh - 12px)',
            backgroundColor: (theme) => theme.palette.grey[100],
            pt: 1,
          }}
        > 

        <QuestionList handleChange={handleChange} handler={handler} />
 
        </Box>}

        <Box>
          <form
            style={{ width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault();
              handler.send('TEXT');
            }}
          >
            <Flex fullWidth sx={{ p: 1, alignItems: 'flex-start' }} spacing={1}>
              {isMobileViewPort && <IconButton onClick={ () => handleChange('sidebarOpen',!handler.sidebarOpen)  }>
                <TextIcon icon="Menu" />
                </IconButton>}
              <IconTextField
              sx={ isMobileViewPort ? {
                width: `calc(100vw - ${!!handler.user ? "128px" : "64px"})`
              } : {}}
                helperText={isMobileViewPort 
                  ? "ChatGPT may produce inaccurate information"
                  : "ChatGPT may produce inaccurate information about people, places, or facts"}
                disabled={busy}
                googlish
                endIcon={
                  busy ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Flex spacing={1}>
                      <IconButton>
                        <TextIcon
                          disabled={!handler.requestText}
                          icon={'Telegram'}
                          onClick={() => handler.send('TEXT')}
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
                placeholder="Type or speak a question"
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

          <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'auto' }}>
            {handler.state.matches('request.query') && <TimerProgress component={LinearProgress} limit={60} auto />}
            {
              <Answers empty={!handler.answers.length}>
                {!handler.answers.length && (
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


                  <Nowrap 
                    sx={{ m: theme => theme.spacing(3,0,1,0)}}
                    small muted>ChatGPT precision settings</Nowrap>
                  <Stack direction={isMobileViewPort ? "column" : "row"} wrap="wrap" spacing={1}> 
                    {handler.tempProps.map((prop, i) => <Option   
                      color={prop.color} 
                      onClick={(e) => handleChange('temperatureIndex', i)}
                      active={i === handler.temperatureIndex} 
                      key={prop.value} 
                      > 
                      <Nowrap hover bold={i === handler.temperatureIndex}>{prop.label}</Nowrap>
                      <Nowrap hover bold={i === handler.temperatureIndex} small wrap>{prop.caption}</Nowrap>
                    </Option>)}
                  </Stack>
                  </>
                )}

                {!!handler.answers.length &&
                  handler.answers.map((response, i) => (
                    <>
                      <Flex
                        wrap="wrap"
                        sx={{
                          p: 2,
                          backgroundColor: (theme) => theme.palette.grey[300],
                          width: '100%',
                        }}
                      >
                        <Question wrap small>
                          {response.question} 
                        </Question>
                        <Spacer />
                        <Nowrap tiny muted>
                          {response.responseTime/1000}s
                        </Nowrap>
                      </Flex>

                      <ReactMarkdown  key={i}>
                        {response.answer}
                      </ReactMarkdown>
                    </>
                  ))}
              </Answers>
            }
          </Box>
        </Box>
      </Columns>
      <Drawer open={handler.sidebarOpen && isMobileViewPort} onClose={() => handleChange('sidebarOpen', false)} anchor="left">
        <QuestionList  handleChange={handleChange}  handler={handler} />
      </Drawer>
    </Layout>
  );
};
ChatPane.defaultProps = {};
export default ChatPane;


// function MyComponent({ data }) {
//   useEffect(() => {
//     const preTags = document.querySelectorAll("pre");
//     preTags.forEach((tag) => {
//       tag.addEventListener("click", handleClick);
//     });

//     return () => {
//       preTags.forEach((tag) => {
//         tag.removeEventListener("click", handleClick);
//       });
//     };
//   }, []);

//   function handleClick(event) {
//     console.log("Clicked pre tag:", event.target);
//   }

//   return (
//     <div>
//       {data.map((item) => (
//         <pre key={item.id}>{item.text}</pre>
//       ))}
//     </div>
//   );
// }