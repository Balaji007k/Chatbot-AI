import ChatWindow from "./components/ChatWindow";
import { useMediaQuery } from 'react-responsive';

function App() {
  const isSmall = useMediaQuery({maxWidth:600})
  return (
    <div className={`${isSmall?'h-[93vh]':'h-screen'} bg-gray-100 flex items-center justify-center py-2 px-1`}>
      <ChatWindow />
    </div>
  );
}

export default App;
