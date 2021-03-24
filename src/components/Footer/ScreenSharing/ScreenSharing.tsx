import React, { useCallback } from 'react';
import { Button } from './../../common/Buttons/Button';
import { FaLaptop } from 'react-icons/fa'
import { useLocalStore } from './../../../store/LocalStore';
import { useConferenceStore } from '../../../store/ConferenceStore';


export const ScreenSharing = () => {
  const localStore = useLocalStore();
  const conferenceStore = useConferenceStore();

  let link = "/screenshare/#" + conferenceStore.conferenceName + "/" + conferenceStore.displayName + "-screenshare/" + localStore.id;

  return <a target="_blank" href={link}><FaLaptop/></a>
}
