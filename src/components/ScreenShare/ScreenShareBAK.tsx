
export const ScreenShare = ({id}) => {

	return (
		<div>
			<video autoPlay={true} className={`remoteTrack screenShare ${id}screen`} id={`${id}video`} />
		</div>
	)
}
