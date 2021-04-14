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
     <button
        onClick={toggleChat}>
                Toggle Chat 
    </button>
    {active? "":<ChatCount></ChatCount> }
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