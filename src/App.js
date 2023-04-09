import { useChat } from './machines'; 
import ChatPane from './components/lib/ChatPane/ChatPane';

import './App.css';

function App() {
  const chat = useChat()
  return (
    <div className="App">
  

<ChatPane handler={chat} />


    </div>
  );
}

export default App;
