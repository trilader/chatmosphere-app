import { render } from '@testing-library/react';
import React from 'react'

import styled from "styled-components"
import { useConferenceStore } from '../../store/ConferenceStore';
import { useLocalStore } from '../../store/LocalStore';

const InfoPanelWrapper = styled.div`
	position: fixed;
	top: 0px;
	left: 0px;
	text-align: initial;
`



const InfoPanel = () => {
	const { pos, user } = useLocalStore()
	return (
		<>
		  <div>{useConferenceStore().displayName || 'me'} ({Math.round(pos.x)}, {Math.round(pos.y)})</div>
	{ Object.entries(useConferenceStore().users).map(user => {
		      		return(
				  <div style={ (user[1].chatmoClient || user[1].linkMain) ? {} : {color:'#ff0000'} }>{user[1].user?._displayName || user[0]} ({Math.round(user[1].pos.x)}, {Math.round(user[1].pos.y)}) {user[0]}/{user[1].linkMain}</div>
			 )
		   	 })}
		</>)
}

export const LocationPanel = () => {
	const conferenceStore = useConferenceStore();
	const localStore = useLocalStore();
	let value;
	// const sendMessage = () => {
	// 	conferenceStore.sendTextMessage(localStore.text)
	//   }
	
	  const onInputChange = (e) =>{
		localStore.setLocalText(e.target.value)
	}

	const onkeydown = (e) => {
		if (e.keyCode == 13){
			conferenceStore.sendTextMessage(localStore.text)
			localStore.setLocalText('')
			value = ''
		}
	}



	return (
		    <InfoPanelWrapper>
				 
				<input type="text" placeholder='Enter Text to Chat' onChange={onInputChange} onKeyDown={onkeydown}  value={localStore.text} />
      {/* <button onClick= {sendMessage}> send Message </button> */}
	  			<ChatMessagePanel />
			    <InfoPanel/>
			</InfoPanelWrapper>
               )
}


const ChatMessagePanel = () => {
	const conferenceStore = useConferenceStore();
	return (
		<>
		  <div style={{border:"solid",backgroundColor:'grey', height:'200px', overflow:'scroll'}  } >
	{ conferenceStore.messages.map(messageObj => {
		      		return(
				  <div>{messageObj.time.toISOString()}:{messageObj.user}:{messageObj.message}</div>
			 )
		   	 })}</div>
		</>)
}


// {/* {conferenceStore.messages.forEach((value)=> ChatMessageView(value.user,value.message,value.time) )} */}
// export const ChatMessageView = (id:string,message:string,time:Date) => {
// 	render(<p  className="chatmessage" > {time.toISOString()}:{id}:{message} </p>)
// }