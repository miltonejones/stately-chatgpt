import { useChat } from './machines'; 
import ChatPane from './components/lib/ChatPane/ChatPane';
import { AuthContext,  useAuthenticator } from './machines';
import { Amplify } from 'aws-amplify'; 
import awsExports from './aws-exports'; 
import AppFooter from './components/lib/AppFooter/AppFooter';
import './App.css';

Amplify.configure(awsExports);


function App() {
  const chat = useChat()
  const authenticator = useAuthenticator(user => chat.send({
    type: 'AUTH',
    user
  }));

  return (
    <AuthContext.Provider value={{ authenticator }}> 
      <ChatPane handler={chat} /> 
      <AppFooter small={chat.isMobileViewPort} />
    </AuthContext.Provider>
  );
}

export default App;
