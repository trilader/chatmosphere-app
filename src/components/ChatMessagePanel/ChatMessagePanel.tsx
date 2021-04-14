import React from "react";
import { useConferenceStore } from "../../store/ConferenceStore";

export const ChatMessagePanel = () => {
	const conferenceStore = useConferenceStore();

	const userMap = new Map<string,string>();
	Object.entries(conferenceStore.users).map(user => {userMap.set(user[0],user[1].user._displayName)})
    const fieldRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
            if (fieldRef.current) {

                fieldRef.current.scrollIntoView({behavior:"smooth"});
            } 
        }
        ,[conferenceStore.messages]);
	return (
		<>
		  <div style={{backgroundColor:'rgba(23,116,203,0.2)', height:'90%', overflow:'auto', maxWidth:'inherit', textAlign:"left",resize:"both"}  } >
	        { conferenceStore.messages.map((messageObj,i,list) => {
                    if(i === list.length-1){
                       
                        return(
                            <div ref={fieldRef}>{messageObj.time.getHours().toString().padStart(2,'0')}:
                            {messageObj.time.getMinutes().toString().padStart(2,'0')}:
                            { messageObj.time.getSeconds().toString().padStart(2,'0').concat('  ')}  
                            
                            {userMap.has(messageObj.user)?userMap.get(messageObj.user):messageObj.user}  :
                            
                            <br/>
                            {isValidHttpUrl(messageObj.message)?LinkMessage(messageObj.message):messageObj.message}</div>
                       )
                    } else {
                        return(
                            <div>{messageObj.time.getHours().toString().padStart(2,'0')}:
                            {messageObj.time.getMinutes().toString().padStart(2,'0')}:
                            { messageObj.time.getSeconds().toString().padStart(2,'0').concat('  ')}  
                            
                            {userMap.has(messageObj.user)?userMap.get(messageObj.user):messageObj.user}  :
                            
                            <br/>
                            {isValidHttpUrl(messageObj.message)?LinkMessage(messageObj.message):messageObj.message}</div>
                       )
                    }
		      		
		   	 })}</div>
		</>)
}


function isValidHttpUrl(string) {
	let url;
	
	try {
		url = new URL(string);
	} catch (_) {
		return false;  
	}
	
	return url.protocol === "http:" || url.protocol === "https:";
	}	

  

const LinkMessage = (message: string) => {
	return (<a target="_blank" href={message}>{message}</a>);
}




