import React, { useEffect, useRef, useCallback, MouseEventHandler } from 'react';

import styled from "styled-components"
import { useConferenceStore } from '../../store/ConferenceStore';
import { useLocalStore } from '../../store/LocalStore';
import { panOptions } from '../PanWrapper/panOptions';

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
				  <div key={user[0]} style={ (user[1].chatmoClient || user[1].linkMain) ? {} : {color:'#ff0000'} }>{user[1].user?._displayName || user[0]} ({Math.round(user[1].pos.x)}, {Math.round(user[1].pos.y)}) {user[0]}/{user[1].linkMain}</div>
			 )
		   	 })}
		</>)
}

const canvasWidth = 200;
const canvasHeight = 200;

const MiniMap = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const ls = useLocalStore();
	const cs = useConferenceStore();

	const fnv32a = (str: String): number => {
		var FNV1_32A_INIT = 0x811c9dc5;
		var hval = FNV1_32A_INIT;
		for ( var i = 0; i < str.length; ++i )
		{
			hval ^= str.charCodeAt(i);
			hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
			hval &= 0xffffffff;
		}
		return hval >>> 0;
	}

    useEffect( () => {
        const canvasObj = canvasRef.current;
		if(!canvasObj)
			return;
		const ctx = canvasObj?.getContext('2d');
		if(!ctx)
			return;
		ctx.clearRect( 0,0, canvasWidth, canvasHeight );
		ctx.strokeStyle = 'black';
		ctx.strokeRect( 0,0, canvasWidth, canvasHeight );

		const roomSize = panOptions.room.size;
		const radius = 5;
		const drawPos = (pos, color, radius, ellipse) => {
			console.log("draw", pos, color, radius);
			ctx.fillStyle = color;
			const px = pos.x / roomSize.x * canvasWidth;
			const py = pos.y / roomSize.y * canvasHeight;
			if(ellipse) {
				ctx.beginPath();
				ctx.ellipse(px, py, radius, radius, 0, 0, 2*Math.PI);
				ctx.fill();
			} else {
				ctx.fillRect(px-radius/2, py-radius/2, radius, radius);
			}
		};

		drawPos(ls.pos, '#f4aa41', 2*radius, true);
		Object.entries(cs.users).forEach(entry => drawPos(entry[1].pos, '#' + (fnv32a(entry[0]) >>> 8).toString(16), radius, false));
    });

	const clickHandler = (event) => {
		const canvasObj = canvasRef.current;
		if(!canvasObj)
			return;
		const rect = canvasObj.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top
		console.log(x, y)
	};

	return( <canvas className="minimap-canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight} onClick={clickHandler}/>)
}

export const LocationPanel = () => {
	return (
		<InfoPanelWrapper>
			<InfoPanel/>
			<MiniMap/>
		</InfoPanelWrapper>
	)
}
