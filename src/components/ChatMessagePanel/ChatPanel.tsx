import React from "react";
import { useEffect } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import styled from "styled-components";
import { useConferenceStore } from "../../store/ConferenceStore";
import { useLocalStore } from "../../store/LocalStore";
import { Button } from "../common/Buttons/Button";
import { ChatMessagePanel } from "./ChatMessagePanel"

const  ChatWrapper = styled.div`
position:absolute;
width:clamp(5%,250px,25%);

top:0px;
left:0px;
z-index:2;
`


export const ChatPanel = () => {

	const conferenceStore = useConferenceStore();
    const [active,setActive] = React.useState<boolean>(false)
    const [unreadMessages,clearMessage] = React.useState<number>(0); 
	const localStore = useLocalStore();
	  const onInputChange = (e) =>{
		localStore.setLocalText(e.target.value)
	}

	const onKeyDown = (e) => {
		if (e.keyCode == 13){
			conferenceStore.sendTextMessage(localStore.text)
			localStore.setLocalText('')
		}
	}

    const toggleChat = (e) => {
        setActive(!active)
        conferenceStore.clearUnreadMessages()
    }


    



 return (
    <ChatWrapper>
     <button style={{
         width:"100%",
    backgroundColor: "#1774cb",
      border: "none",
      color: "white",
      padding: "15px 32px",
      textAlign:'center',
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px"
    }}
        onClick={toggleChat}>
                Toggle Chat 
    {active? "":<ChatCount></ChatCount> }
    </button>
    <div className={active?"block-chat":"hide-chat"} >

    <ChatMessagePanel />
     <input id="textinput"  type="text" placeholder='Enter Text to Chat' onChange={onInputChange} onKeyDown={onKeyDown}  value={localStore.text} />
     </div>
     </ChatWrapper>)
}


const ChatCount = () => {
    const conferenceStore = useConferenceStore();
    return (<>({conferenceStore.unreadMessages.toString()})</>)
}