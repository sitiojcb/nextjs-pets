import Pusher from "pusher-js";

import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketId, setSocketId] = useState();
  // const [messageLog, setMessageLog] = useState([
  //   { message: "Mensaje 1 de prueba chat", selfMessage: false },
  //   { message: "Mensaje 2 de prueba chat", selfMessage: false },
  //   { message: "Mensaje 3 de prueba chat", selfMessage: false },
  //   { message: "Mensaje propio,", selfMessage: true },
  // ]);
  const [messageLog, setMessageLog] = useState([]); //ahora viene de pusher
  const [userMessage, setUserMessage] = useState("");
  const chatField = useRef(null);
  const chatLogElement = useRef(null);
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHERKEY, {
      cluster: "sa1",
    });
    //necesito que recuerde el socket id y hacerlo accesible
    pusher.connection.bind("connected", () => {
      setSocketId(pusher.connection.socket_id);
    });
    //como recibimos de otros?
    const channel = pusher.subscribe("private-petchat");
    channel.bind("message", (data) => {
      //console.log("mensaje ", data);
      setMessageLog((prev) => [...prev, data]);
    });
    // return () => {
    //   second;
    // };
  }, []);
  //---------
  useEffect(() => {
    if (messageLog.length) {
      chatLogElement.current.scrollTop = chatLogElement.current.scrollHeight;
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
    // return () => {
    //   second;
    // };
  }, [messageLog]);

  function openChatClick() {
    //console.log("click en chat");
    setIsChatOpen(true);
    setUnreadCount(0);
    setTimeout(() => {
      chatField.current.focus();
    }, 350);
  }
  function closeChatClick() {
    setIsChatOpen(false);
  }
  function handleChatSubmit(e) {
    //enviamos a pusher
    e.preventDefault();
    fetch("/admin/send-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   message: "mensaje hardcode de prueba",
      //   socket_id: socketId,
      // }),
      body: JSON.stringify({
        message: userMessage,
        socket_id: socketId,
      }),
    });
    //para mostrar los que yo escribo en mi chat popup
    setMessageLog((prev) => [
      ...prev,
      { selfMessage: true, message: userMessage },
    ]);
    //limpio el input luego de escribir con
    setUserMessage("");
  }
  //para mostrar los mensajes que el usr escribe
  function handleInputChange(e) {
    setUserMessage(e.target.value);
  }
  return (
    <>
      <div className="open-chat" onClick={openChatClick}>
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          className="bi bi-chat-text-fill"
          viewBox="0 0 16 16"
        >
          <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
        </svg>
      </div>
      <div
        className={
          isChatOpen
            ? "chat-container chat-container--visible"
            : "chat-container"
        }
      >
        <div className="chat-title-bar">
          <h4>Staff Team Chat</h4>
          <svg
            onClick={closeChatClick}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-x-square-fill"
            viewBox="0 0 16 16"
          >
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
          </svg>
        </div>
        <div className="chat-log" ref={chatLogElement}>
          {messageLog.map((item, index) => {
            return (
              <div
                key={index}
                className={
                  item.selfMessage
                    ? "chat-message chat-message--self"
                    : "chat-message"
                }
              >
                <div className="chat-message-inner">{item.message}</div>
              </div>
            );
          })}
        </div>
        <form className="" onSubmit={handleChatSubmit}>
          <input
            value={userMessage}
            onChange={handleInputChange}
            ref={chatField}
            type="text"
            autoComplete="off"
            placeholder="Type your message here "
          />
        </form>
      </div>
    </>
  );
}
