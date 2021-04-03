import React, { useEffect, useState } from 'react'
import JitsiConnection from '../../components/JitsiConnection/JitsiConnection'
import { ErrorHandler } from '../../components/common/Info/ErrorHandler'
import { useConnectionStore } from './../../store/ConnectionStore'
import { useConferenceStore } from './../../store/ConferenceStore'
import {useParams} from 'react-router-dom'
import { Localuser } from '../../components/Localuser/Localuser'
import { UserDragContainer } from '../../components/Localuser/LocalUserContainer'
import { PanWrapper } from '../../components/PanWrapper/PanWrapper'
import { Room } from '../../components/Room/Room'
import { useLocalStore } from '../../store/LocalStore'

export const ScreenShare = () => {
  const conference = useConferenceStore(state => state.conferenceObject)
  const setLocalTracks = useLocalStore(store => store.setLocalTracks)
  const initJitsiMeet = useConnectionStore(store => store.initJitsiMeet)
  const jsMeet = useConnectionStore(store => store.jsMeet)
  const conferenceIsJoined = useConferenceStore(store => store.isJoined)
  let {id, displayName, linkPrimary} = useParams() //get Id from url, should error check here I guess


  useEffect(() => {
    initJitsiMeet()
  }, [initJitsiMeet])

  const announceAndCreateTrack = () => {
    conference?.sendCommand('link', {value: JSON.stringify({id: conference.myUserId(), main: linkPrimary})})

    jsMeet
    ?.createLocalTracks({ devices: [ 'desktop' ] }, true)
    .then(tracks => {
      console.log(tracks);
      setLocalTracks(tracks)
    })
    .catch(error => {
      console.log(error)
    });
  }

  const startSharing = (trigger) => {
    if(conferenceIsJoined){
      announceAndCreateTrack();
    }
  }

  return (
    <React.Fragment>
      <button onClick={startSharing}>HELLO!</button>
      <ErrorHandler />
      <JitsiConnection />
      <Localuser audioRadius />

    </React.Fragment>
  )
}

export default ScreenShare;
