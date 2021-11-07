import * as React from 'react';
import { Screen } from '../../pages/ScreenShare/Screen';
import { useConferenceStore } from './../../store/ConferenceStore';
import { User } from "./User"

//TODO check if incorporation of user Object causes rerendering problems
export const Users = () => {

  const {users} = useConferenceStore()
  return (
    <>
    {Object.entries(users).map(user => {
      //@ts-ignore
      if(user[1].video?.videoType === "desktop"){
        return <Screen id={user[0]}/>
      } else {
        return <User key={user[0]} user={user[1]} id={user[0]}/>
      }
    })}
    </>
  )
}