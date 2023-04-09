import React from 'react';
import {
  styled, 
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Columns,
  Flex,
  Nowrap,
  Btn,
  TextIcon,
  IconTextField,
  TinyButton
} from '../../../styled';
import ReactMarkdown from 'react-markdown';
// import rehypeHighlight from 'rehype-highlight';
// import Prism from 'prismjs';
// import 'prismjs/themes/prism-tomorrow.css';


function CodeBlock({ language, value }) {
  // const prismLanguage = Prism.languages[language];
  // const highlightedCode = Prism.highlight(value, prismLanguage, language);

  return (
    <pre>
      This is the code
      <code dangerouslySetInnerHTML={{ __html: value }} />
    </pre>
  );
}

const Bar = styled((props) => <Flex {...props} spacing={1} />)(
  ({ theme, active }) => ({
    margin:   theme.spacing(2, 0),
    padding: theme.spacing(1),
    borderRadius: '.25rem',
    backgroundColor: !active ? 'transparent' : theme.palette.grey[300]
  }))

const Question = styled('p') (({ theme}) => ({
  fontSize: '0.9rem',
  padding: 0,
  margin: 0,
  fontWeight: 600
}))

const Layout = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0),
}));

const Answers = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  // height: `calc(100vh - 120px)`,
  overflow: 'auto',
  padding: theme.spacing(1),
  width: 'calc(80vw -  16px)',
  display: 'flex',
  flexDirection: 'column',
  // alignItems: 'flex-end',
  justifyContent: 'flex-end',
}));

const ChatPane = ({ handler }) => {
  const disabled = !handler.state.matches('request.response');
  const listening = handler.state.matches('listening');
  const busy  = handler.state.matches('request.query');
  const renderers = {
    code: CodeBlock,
  };

  const priorQuestions = Object.keys(handler.sessions);
  return (
    <Layout>
      <Columns
        sx={{ alignItems: 'flex-start', height: '100vh' }}
        columns="20vw 1fr"
      >
        <Box sx={{ height: '100%' , backgroundColor: theme => theme.palette.grey[100], pt: 1  }}>
       

          {/* {JSON.stringify(handler.state.value)} */}
 
          <Box sx={{ p: theme => theme.spacing(0, 1)}}>
          <Btn
              startIcon={<TextIcon icon="Add" />}
              variant="contained"
              fullWidth
              disabled={disabled}
              onClick={() => handler.send('QUIT')}
            >
              new chat
            </Btn>

          </Box>

          <Box sx={{ p: theme => theme.spacing(0, 1)}}>
            {/* {handler.answers.map((response, i) => (
              <>
                <Flex>
                  <Nowrap>{response.question}</Nowrap>
                </Flex>
              </>
            ))} */}


        {!!handler.answers.length && <Bar active>
          <Nowrap>{handler.answers[0].question}</Nowrap>  
          <TinyButton icon="BorderColor" />
          <TinyButton icon="Delete" />
          </Bar>}


         {priorQuestions.map(query => <Bar>
          <TinyButton icon="Chat" />
          <Nowrap muted hover>{query}</Nowrap> 
         </Bar>)}
          </Box>
        </Box>

        <Box>
          <form
          style={{ width: '100%'}}
          onSubmit={(e) => {
            e.preventDefault();
            handler.send('TEXT');
          }}
        > 
          <Flex fullWidth sx={{ p: 1 }} spacing={1}>
        
            <IconTextField
            helperText="ChatGPT may produce inaccurate information about people, places, or facts"
              disabled={busy}
              googlish
              endIcon={
                busy ? 
                <CircularProgress size={24} /> 
                : 
                <Flex spacing={1}>
                  
               <IconButton><TextIcon
                  disabled={!handler.requestText}
                  icon={'Telegram'}
                  onClick={() => handler.send('TEXT')}
                /></IconButton> 

              <IconButton>   <TextIcon
                  disabled={disabled}
                  icon={listening ? 'MicOff' : 'Mic'}
                  onClick={() => handler.send('ASK')}
                /></IconButton> 
                
                </Flex>
              }
              fullWidth
              value={handler.requestText} 
              placeholder="Type or speak a question"
              name="requestText"
              onChange={(e) => handler.send({
                type: 'CHANGE',
                key: e.target.name,
                value: e.target.value
              })}
            />
          </Flex>

     
</form>
         

          <Box
            sx={{ height: 'calc(100vh - 100px)', overflow: 'auto'}}
            >

          {!!handler.answers.length && <Answers>
              {handler.answers.map((response, i) => (
                <>
                  <Flex
                    wrap="wrap"
                    sx={{
                      p: 2,
                      backgroundColor: (theme) => theme.palette.grey[300],
                      width: '100%',
                    }}
                  >
                    <Question wrap small>{response.question}</Question>
                  </Flex>

                  <ReactMarkdown renderers={renderers} key={i}>
                    {response.answer}
                  </ReactMarkdown>
                </>
              ))}
            </Answers>}

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