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
	return (
		    <InfoPanelWrapper>
			    <InfoPanel/>
                    </InfoPanelWrapper>
               )
}
