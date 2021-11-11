import { Screen } from '../../pages/ScreenShare/Screen';
import { useConferenceStore } from './../../store/ConferenceStore';
import { User } from "./User"

//TODO: this is rerendering on every update of users or localusers position - thats not necessary; check if it renders
const selector = state => state.users

export const Users = () => {

  const users = useConferenceStore(selector);

  return (
    <>
    {Object.entries(users).map(user => {
      //@ts-ignore
      if(user[1].screenOf){
        //@ts-ignore
        return <Screen id={user[0]} linkedId={user[1].screenOf}/>
      } else {
        return <User key={user[0]} user={user[1]} id={user[0]}/>
      }
    })}
    </>
  )
}