import { useEffect, useState } from "react";
import { io } from "socket.io-client";
function ContestsList() {
  const [serverMessage, setServerMessage] = useState<string>("");
  const socket1 = io("http://localhost:8081");
  console.log(socket1)
  socket1.on("connect", () => {
    console.log("Connected to server.");
  });
  // useEffect(() => {
  //   const socket = new WebSocket("ws://localhost:8081");
    
  
  //   socket.onopen = () => {
  //     console.log("WebSocket connection established.");
  //   };
  
  //   socket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };
  
  //   socket.onclose = (event) => {
  //     if (!event.wasClean) {
  //       console.error("WebSocket closed unexpectedly:", event);
  //     } else {
  //       console.log("WebSocket closed cleanly.");
  //     }
  //   };
  
  //   return () => {
  //     socket.close();
  //   };
  // }, []);
  

  return (
    <div>
      <h1>Contests List</h1>
      <div>
        {/* You can display the server's response here */}
        <p>Message from server: {serverMessage}</p>
      </div>

      {/* Add other UI components for contests here */}
    </div>
  );
}

export default ContestsList;
