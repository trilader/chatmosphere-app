import { useEffect } from 'react';
import { Screen } from '../../pages/ScreenShare/Screen';
import { useConferenceStore } from './../../store/ConferenceStore';
import { User } from "./User"

//TODO: this is rerendering on every update of users or localusers position - thats not necessary; check if it renders
const selector = state => state.users

export const Users = () => {

  const users = useConferenceStore(selector);

  // useEffect(()=> {
  //   console.log(users)
  // }, [users])

  return (
    <>
    {Object.entries(users).map(user => {
      //@ts-ignore
      if(user[1].video?.videoType === "desktop"){
        //@ts-ignore
        console.log("FIREFOX WAS GEHT", user[1].user._properties.linkedUser)
        //@ts-ignore
        return <Screen id={user[0]} linkedId={user[1].user._properties.linkedUser}/>
      } else {
        return <User key={user[0]} user={user[1]} id={user[0]}/>
      }
    })}
    </>
  )
}