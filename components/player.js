import React, { Component, createRef } from "react";

class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isExpanded: false,
			isPlaying: false,
			isBuffering: false,
			currentTime: 0,
			totalDuration: 0,
			currentTrackIndex: null,
			repeatMode: "none", // "none", "single", "playlist"
			isShuffling: false,
			currentTrack: null,
		};
		this.audioRef = createRef(); // Use React ref
	}

	componentDidMount() {
		const audio = this.audioRef.current;
		audio.addEventListener("loadedmetadata", this.setDuration);
		audio.addEventListener("timeupdate", this.updateProgress);
		audio.addEventListener("waiting", this.setBufferingTrue);
		audio.addEventListener("pause", this.handlePause);
		audio.addEventListener("playing", this.handlePlaying);
		audio.addEventListener("canplay", this.setBufferingFalse);
		audio.addEventListener("ended", this.handleTrackEnd);
		audio.addEventListener("error", this.handleAudioError);

		if (this.props.playList.length !== 0) this.setTrack(0);
	}

	componentWillUnmount() {
		const audio = this.audioRef.current;
		audio.removeEventListener("loadedmetadata", this.setDuration);
		audio.removeEventListener("timeupdate", this.updateProgress);
		audio.removeEventListener("waiting", this.setBufferingTrue);
		audio.removeEventListener("pause", this.handlePause);
		audio.removeEventListener("playing", this.handlePlaying);
		audio.removeEventListener("canplay", this.setBufferingFalse);
		audio.removeEventListener("ended", this.handleTrackEnd);
		audio.removeEventListener("error", this.handleAudioError);

		this.resetAudio();
	}

	handleExpand = () => {
		this.setState((prevState) => ({ isExpanded: !prevState.isExpanded }));
	};

	updateProgress = () => {
		this.setState({ currentTime: this.audioRef.current.currentTime });
	};

	setDuration = () => {
		this.setState({ totalDuration: this.audioRef.current.duration });
	};

	handleAudioError = () => {
		console.error("Error loading audio");
		this.setState({
			currentTrack: null,
			currentTime: 0,
			totalDuration: 0,
		});
	};

	changePlayList = (newPlayList) => {
		const { currentTrackIndex } = this.state;
		let updatedIndex = currentTrackIndex;

		if (currentTrackIndex !== null) {
			const currentTrack = this.props.playList[currentTrackIndex];
			updatedIndex = newPlayList.findIndex(track => track.src === currentTrack.src);
			if (updatedIndex === -1) {
				this.resetAudio();
				updatedIndex = null;
			}
		}

		this.setState({ currentTrackIndex: updatedIndex }, () => {
			if (newPlayList.length > 0 && newPlayList[0].src !== this.state.currentTrack.src) {
				this.setTrack(0);
			} else if (updatedIndex !== null) {
				this.setTrack(updatedIndex);
			}
		});
		this.props.updatePlayList([...newPlayList]);
	};

	handleTrackEnd = () => {
		const { repeatMode, isShuffling, currentTrackIndex } = this.state;

		if (repeatMode === "single") {
			this.audioRef.current.currentTime = 0;
			this.audioRef.current.play();
		} else if (isShuffling) {
			this.playShuffledTrack();
		} else if (repeatMode === "playlist" || currentTrackIndex < this.props.playList.length - 1) {
			this.playNextTrack();
		}
	};

	togglePlayPause = () => {
		if (this.state.isPlaying) {
			this.audioRef.current.pause();
		} else {
			this.audioRef.current.play();
		}
		this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
	};

	handlePause = () => {
		this.setState({ isPlaying: false });
	};

	handlePlaying = () => {
		this.setState({ isPlaying: true });
	};

	setBufferingTrue = () => {
		this.setState({ isBuffering: true });
	};

	setBufferingFalse = () => {
		this.setState({ isBuffering: false });
	};

	playNextTrack = () => {
		const { currentTrackIndex, repeatMode } = this.state;

		if (currentTrackIndex < this.props.playList.length - 1) {
			this.setTrack(currentTrackIndex + 1);
		} else if (repeatMode === "playlist") {
			this.setTrack(0);
		}
	};

	playPreviousTrack = () => {
		if (this.state.currentTrackIndex > 0) {
			this.setTrack(this.state.currentTrackIndex - 1);
		}
	};

	playShuffledTrack = () => {
		const { currentTrackIndex } = this.state;

		let randomIndex;
		do {
			randomIndex = Math.floor(Math.random() * this.props.playList.length);
		} while (randomIndex === currentTrackIndex);

		this.setTrack(randomIndex);
	};

	toggleRepeatMode = () => {
		const modes = ["none", "single", "playlist"];
		const currentModeIndex = modes.indexOf(this.state.repeatMode);

		this.setState({ repeatMode: modes[(currentModeIndex + 1) % modes.length] });
	};

	toggleShuffle = () => {
		this.setState((prevState) => ({ isShuffling: !prevState.isShuffling }));
	};

	setTrack = (index) => {
		if (!this.props.playList[index]) return;

		const track = this.props.playList[index];
		this.setState({
			currentTrackIndex: index,
			currentTrack: track,
			isPlaying: true,
		});

		this.audioRef.current.src = track.src;
		this.audioRef.current.play();
	};

	seekTrack = (event) => {
		this.audioRef.current.currentTime = event.currentTarget.value;
	};

	formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	removeTrack = (trackIndex) => {
		const { currentTrackIndex } = this.state;
		const updatedPlaylist = this.props.playList.filter((_, index) => index !== trackIndex);
		if (updatedPlaylist.length === 0) {
			this.resetAudio();
			this.setState({
				currentTrack: null,
				currentTrackIndex: null,
				isPlaying: false,
			});
			this.changePlayList([]);
		}
		else if (trackIndex === currentTrackIndex) {
			this.resetAudio();
			const newTrackIndex =
				trackIndex === updatedPlaylist.length ? Math.max(trackIndex - 1, 0) : trackIndex;
			this.setState({
				currentTrack: updatedPlaylist[newTrackIndex] || null,
				currentTrackIndex: updatedPlaylist.length > newTrackIndex ?
					newTrackIndex : null,
				isPlaying: false,
			});
			this.changePlayList(updatedPlaylist);
			this.setTrack(newTrackIndex);
		} else {
			const newTrackIndex =
				trackIndex < currentTrackIndex ? Math.max(currentTrackIndex - 1, 0) : currentTrackIndex;
			this.setState({
				currentTrackIndex: newTrackIndex,
			});
			this.changePlayList(updatedPlaylist);
		}
	};

	resetAudio = () => {
		this.audioRef.current.pause();
		this.audioRef.current.currentTime = 0;
		this.audioRef.current.src = "";

		this.setState({
			currentTime: 0,
			totalDuration: 0,
			currentTrack: null,
			currentTrackIndex: null,
			isPlaying: false,
			isBuffering: false,
		});
	};

	render() {
		const {
			isExpanded,
			isPlaying,
			isBuffering,
			currentTime,
			totalDuration,
			currentTrack,
			repeatMode,
			isShuffling,
		} = this.state;

		return (
			<div className={`${isExpanded ? "h-full md:h-96" : "" } max-w-md w-full absolute bottom-0 left-0 z-40 bg-white rounded-t-xl border-x border-t border-gray-200 overflow-auto`}>
				<audio ref={this.audioRef}></audio> {/* Audio element */}
				<div className={`${isExpanded ? "hidden" : "flex" } relative w-full flex-row items-center p-2 gap-2`}>
					<div className="absolute bottom-0 -z-10 left-0 h-full bg-sky-200/25" style={{width: `${currentTime / totalDuration * 100}%`}}></div>
					<div className={`w-10 h-10 rounded-md overflow-hidden border ${isBuffering ? 'border-yellow-500' : 'border-gray-100' } transition duration-800`}>
						<img src={currentTrack ? currentTrack.thumbnailMin : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzAhqWfbijrFBGnEPl8zPR9lvnAocwAXzjQ&s' } alt="Track thumbnail" className="object-cover" />
					</div>
					<div className="grow">
						<h2 className="text-md font-bold leading-tight">{currentTrack ? currentTrack.name : "No Track"}</h2>
						<p className="text-xs text-gray-400">{currentTrack ? currentTrack.artist : ""}</p>
					</div>
					<div className="inline-flex gap-4">
						<button className="p-1" onClick={this.togglePlayPause} aria-label={isPlaying ? "Pause" : "Play" }>
							<i className={`fas ${isPlaying ? "fa-pause" : "fa-play" }`} />
						</button>
						<button className="p-1" onClick={this.handleExpand} aria-label="Expand player">
							<i className="fas fa-chevron-up" />
						</button>
					</div>
				</div>

				<div className={ `${isExpanded ? "" : "hidden" } w-full p-2`} aria-hidden={!isExpanded}>
					<button className="p-1 sticky block ml-auto" onClick={this.handleExpand} aria-label="Collapse player">
						<i className="fas fa-chevron-down" />
					</button>
					<div className="w-full">
						<div className={`w-52 h-52 mx-auto rounded-xl shadow-xl overflow-hidden mb-4 ${isBuffering ? 'border-4 border-yellow-500' : '' } transition duration-800`}>
							<img src={currentTrack ? currentTrack.thumbnailMax : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzAhqWfbijrFBGnEPl8zPR9lvnAocwAXzjQ&s' } alt="Track thumbnail" className="object-cover" />
						</div>
						<div className="flex flex-col items-center">
							<h2 className="text-lg font-bold leading-tight">{currentTrack ? currentTrack.name : "No Track"}</h2>
							<span className="text-sm text-gray-400"> { currentTrack ? currentTrack.artist : "" }
							</span>
							<div className="w-72 mt-4">
								<input type="range" min="0" max={totalDuration} value={currentTime} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" onInput={this.seekTrack} aria-label="Seek track" aria-valuemin="0" aria-valuemax={totalDuration} aria-valuenow={currentTime} />
							</div>
							<div className="text-xs text-gray-500 flex justify-between w-72 mt-1">
								<span>{this.formatTime(currentTime)}</span>
								<span> { this.formatTime(totalDuration) }</span>
							</div>
							<div className="inline-flex flex-row justify-center items-center gap-4 mt-2">
								<button className="text-lg p-2" onClick={this.toggleRepeatMode} aria-label={`Repeat mode: ${repeatMode}`}>
									<i className={`fas ${repeatMode==="single" ? "fa-repeat text-blue-500" : repeatMode==="playlist" ? "fa-rotate text-blue-500" : "fa-repeat text-gray-800" }`} />
								</button>
								<button className="text-xl p-2" onClick={ this.playPreviousTrack } aria-label="Previous track">
									<i className="fas fa-backward-step" />
								</button>
								<button className="text-4xl p-3 text-yellow-400" onClick={ this.togglePlayPause } aria-label={isPlaying ? "Pause track" : "Play track" }>
									<i className={`fas ${isPlaying ? "fa-pause-circle" : "fa-play-circle" }`} />
								</button>
								<button className="text-xl p-2" onClick={ this.playNextTrack } aria-label="Next track">
									<i className="fas fa-forward-step" />
								</button>
								<button className="text-lg p-2" onClick={ this.toggleShuffle } aria-label={`Shuffle: ${isShuffling ? "On" : "Off" }`}>
									<i className={`fas ${isShuffling ? "fa-random text-blue-500" : "fa-random" }`} />
								</button>
							</div>
						</div>
					</div>
					<div className="w-full mt-2">
						<h2 className="text-sm font-bold text-gray-400 mb-2">QUEUE</h2>
						<ul className="w-full">
							{
							this.props.playList.length ? this.props.playList.map((track, index) => (
							<li key={index} className="px-3 py-2 flex flex-row items-center gap-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={()=> this.setTrack(index)}>
								<img src={track ? track.thumbnailMin : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzAhqWfbijrFBGnEPl8zPR9lvnAocwAXzjQ&s' } alt="Track thumbnail" className="w-8 h-8 rounded-md" />
								<div className="grow flex flex-col">
									<h3 className="text-sm font-semibold leading-tight truncate">{track.name}</h3>
									<span className="text-xs text-gray-500 leading-none truncate">{track.artist}</span>
								</div>
								<span className="p-1 fas fa-times" onClick={(e)=> {e.stopPropagation();this.removeTrack(index);}} aria-label="Remove track" />
							</li>
							)) :
							<li className="px-3 py-2 flex flex-row items-center gap-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
								<div className="grow flex flex-col">
									<h3 className="text-sm font-semibold leading-tight truncate">Nothing in your playlist!</h3>
									<span className="text-xs text-gray-500 leading-none truncate">Go find some songs to enjoy.</span>
								</div>
							</li>
							}
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

export default Player;