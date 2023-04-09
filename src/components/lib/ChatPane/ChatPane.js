import React from 'react';
import {
  styled,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Card,
  Badge
} from '@mui/material';
import {
  Columns,
  Flex,
  Nowrap,
  Btn,
  TextIcon,
  IconTextField,
  TinyButton,
  Spacer
} from '../../../styled';
import ReactMarkdown from 'react-markdown';
import Login from '../Login/Login';
import ProfilePhotoForm from '../ProfilePhotoForm/ProfilePhotoForm';
// import rehypeHighlight from 'rehype-highlight';
// import Prism from 'prismjs';
// import 'prismjs/themes/prism-tomorrow.css';

function CodeBlock({ language, value }) {
  // const prismLanguage = Prism.languages[language];
  // const highlightedCode = Prism.highlight(value, prismLanguage, language);

  return (
    <pre>
     {value}
    </pre>
  );
}

const Bar = styled((props) => <Flex {...props} spacing={1} />)(
  ({ theme, active }) => ({
    marginBottom: theme.spacing(0.5, 0),
    padding: theme.spacing(1),
    borderRadius: '.25rem',
    backgroundColor: !active ? 'transparent' : theme.palette.grey[300],
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
  // overflow: 'auto',
  padding: theme.spacing(1),
  width: 'calc(80vw -  16px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: empty ? 'center' : 'flex-start',
  justifyContent: empty ? 'center' : 'flex-start',
}));

const ChatPane = ({ handler }) => {
  const disabled = !handler.state.matches('request.response');
  const listening = handler.state.matches('listening');
  const busy = handler.state.matches('request.query');
  // const renderers = {
  //   code: CodeBlock,
  // };

  const priorQuestions = Object.keys(handler.sessions);
  const firstQuestion = !handler.answers.length 
    ? null
    : handler.answers[handler.answers.length - 1].question;

    
  return (
    <Layout>
      <Columns
        sx={{ alignItems: 'flex-start', height: '100vh' }}
        columns="20vw 1fr"
      >
        <Box
          sx={{
            height: 'calc(100vh - 12px)',
            backgroundColor: (theme) => theme.palette.grey[100],
            pt: 1,
          }}
        >
          {/* {JSON.stringify(handler.state.value)} */}

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
                <TinyButton icon="Delete" />
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
 

            <Login >
              <Bar sx={{ mb: 4 }}>
                <TinyButton icon="Lock" />
              <Nowrap hover>Sign {!!handler.user ? "Out" : "In"}</Nowrap>
              </Bar>
            </Login>
          </Box>
        </Box>

        <Box>
          <form
            style={{ width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault();
              handler.send('TEXT');
            }}
          >
            <Flex fullWidth sx={{ p: 1, alignItems: 'flex-start' }} spacing={1}>
              <IconTextField
                helperText="ChatGPT may produce inaccurate information about people, places, or facts"
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
                fullWidth
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

                  <Flex wrap="wrap" spacing={1}> 
                  {handler.tempProps.map((prop, i) => <Card    
                    onClick={(e) =>
                      handler.send({
                        type: 'CHANGE',
                        key: 'temperatureIndex',
                        value: i
                      })
                    }
                    sx={{
                      p: 1,
                      width: 200,
                      height: 100,
                      cursor: 'pointer',
                      color: theme => theme.palette.common.white,
                      backgroundColor: theme => i === handler.temperatureIndex 
                        ? theme.palette[prop.color].dark
                        : theme.palette[prop.color].light,
                        outlineOffset: 1,
                        outline: theme => i === handler.temperatureIndex 
                          ? `solid 2px ${theme.palette[prop.color].dark}`
                          : "none"
                    }}
                  
                  key={prop.value} >

                    <Nowrap hover bold={i === handler.temperatureIndex}>{prop.label}</Nowrap>
                      <Nowrap hover small wrap>{prop.caption}</Nowrap>
                  </Card>)}
                </Flex>
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