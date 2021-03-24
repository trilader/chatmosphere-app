import {useConferenceStore} from './../../store/ConferenceStore'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

export interface DragProps {
  initPos:Point
  children:any
  currentScale:number
  panOffset:Point
  callback: (Point)=>void
}

interface Point {
  x:number,
  y:number
}
 
const DragElement = styled.div`
  position: absolute;
`

const DragWrapper = ({initPos={x:0,y:0}, children, callback=(pos)=>null, currentScale = 1, panOffset}:DragProps) => {
  const conferenceStore = useConferenceStore();
  
  panOffset = panOffset || {x:0,y:0}
  const clickDelta:any = useRef()
  const element:any = useRef()

  const onDrag = (e) => {
    
    e.preventDefault();
    e.stopPropagation();
    if (element.current !== undefined) {
        const xPos = Math.trunc(
            e.clientX / currentScale - clickDelta.current.x
        );
        const yPos = Math.trunc(
            e.clientY / currentScale - clickDelta.current.y
        );
        

        // element?.current?.setAttribute('style', `left:${xPos}px; top:${yPos}px`)
       sharedUpdate(xPos,yPos)
    }
  };




  const sharedUpdate = (xPos,yPos) => {
    const positions = Object.entries(conferenceStore.users).map(user =>  { return {position: user[1].pos, userId :user[1].id} })

    // positions.forEach(pos => console.log(`overlaps: ${Math.sqrt((xPos-pos.x)**2 + (yPos-pos.y)**2)<283}  ${xPos-pos.x}, ${yPos-pos.y} distance = ${Math.sqrt((xPos-pos.x)**2 + (yPos-pos.y)**2)}   `))
    
    positions.forEach(pos => {
      const distance = 233
      if(Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2)<distance){
        // console.log(`${xPos-pos.position.x}, ${yPos-pos.position.y}`)
        // console.log(Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2))
        const distanceToGain= distance - Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2)
        const x = (xPos-pos.position.x)/Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2)
        const y = (yPos-pos.position.y)/Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2)
        // console.log(x,y)
        xPos = xPos + x*distanceToGain
        yPos = yPos + y*distanceToGain

        // console.log(`overlaps: ${Math.sqrt((xPos-pos.position.x)**2 + (yPos-pos.position.y)**2)<283}  ${xPos-pos.position.x}, ${yPos-pos.position.y}   `)
        // console.log(`overlaps: ${pos.userId}  `)
      }
      }
      )
    // conferenceStore.users.map(user =>  user.pos)
    element?.current?.setAttribute(
      'style',
      `transform:translate(${xPos}px, ${yPos}px);`
  );
  callback({ x: xPos, y: yPos });


  }



  const onUp = (e) => {
    e.preventDefault();
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('mousemove', onDrag);
  };

  const onUpTouch = (e) => {
    e.preventDefault();
    document.removeEventListener('touchstop', onUpTouch);
    document.removeEventListener('touchmove', onDragTouch);
    };

  const onDragTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (element.current !== undefined) {
        const xPos = Math.trunc(-clickDelta.current.x + e.touches[0].screenX/currentScale)
        const yPos = Math.trunc(-clickDelta.current.y + (e.touches[0].screenY)/currentScale)

        sharedUpdate(xPos,yPos)

        // element?.current?.setAttribute(
        //     'style',
        //     `transform:translate(${xPos}px, ${yPos}px);`
        // );
        // console.log({ x: xPos, y: yPos });
        // callback({ x: xPos, y: yPos });
    }
  };



  const onDownTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const boundingRect = e.currentTarget.getBoundingClientRect();

    const transform:String = element?.current?.style.transform
    const xandy = transform.split('(')[1].split(')')[0].split(',').map(value => parseFloat(value.replace('px','')))
    const x = -xandy[0]
    const y = -xandy[1]
    // console.log(x,y)
    clickDelta.current = {
        x: Math.trunc(
            (e.touches[0].screenX  + x*currentScale) / currentScale
        ),
        y: Math.trunc(
            (e.touches[0].screenY + y*currentScale) / currentScale
        ),
    };
    document.addEventListener('touchstop', onUpTouch);
    document.addEventListener('touchmove', onDragTouch);
  };

  const onDown = (e) => {
    e.preventDefault();
    const boundingRect = e.currentTarget.getBoundingClientRect();
    clickDelta.current = {
        x: Math.trunc(
            (e.clientX - boundingRect.x + panOffset.x) / currentScale
        ),
        y: Math.trunc(
            (e.clientY - boundingRect.y + panOffset.y) / currentScale
        ),
    };
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mousemove', onDrag);
  };


  useEffect(() => {
    // element?.current?.setAttribute('style', `left:${initPos.x}px; top:${initPos.y}px`)
    element?.current?.setAttribute('style', `transform:translate(${initPos.x}px, ${initPos.y}px);`)
    // this is by purpose & needed to set the pos once only initially
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    //   #onMouseDown={onDown}
    <DragElement ref={element} onMouseDown={onDown} onTouchStartCapture={onDownTouch}  id="DragElement">
      {children}
    </DragElement>
  )
}

export default DragWrapper
// 2529, y: -2256