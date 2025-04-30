import React, { Component, createRef } from "react";
import { AppContext } from '../context';
import { renderText } from './utilities/all';

class Player extends Component {
	static contextType = AppContext;

	constructor(props) {
		super(props);
		this.state = {
			isExpanded: false,
			isPlaying: false,
			isBuffering: false,
			currentTime: 0,
			totalDuration: 0,
			currentTrackIndex: 0,
			repeatMode: "none",
			isShuffling: false,
			currentTrack: null,
		};
		this.audioRef = createRef();
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

		if (this.context.playList.length !== 0) this.setTrack(0);

		this.context.setPlayerMethods({ setTrack: this.setTrack });

		if ('mediaSession' in navigator) {
			navigator.mediaSession.setActionHandler('play', () => {
				this.togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('pause', () => {
				this.togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('nexttrack', () => {
				this.playNextTrack();
			});

			navigator.mediaSession.setActionHandler('previoustrack', () => {
				this.playPreviousTrack();
			});

			navigator.mediaSession.setActionHandler('seekbackward', (details) => {
				this.audioRef.current.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0);
			});

			navigator.mediaSession.setActionHandler('seekforward', (details) => {
				this.audioRef.current.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration);
			});
		}
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
			const currentTrack = this.context.playList[currentTrackIndex];
			updatedIndex = newPlayList.findIndex(track => track.id === currentTrack.id);
			if (updatedIndex === -1) {
				this.resetAudio();
				updatedIndex = null;
			}
		}

		this.setState({ currentTrackIndex: updatedIndex }, () => {
			if (updatedIndex !== null) {
				this.setTrack(updatedIndex);
			}
		});
		this.context.updatePlayList([...newPlayList]);
	};

	handleTrackEnd = () => {
		const { repeatMode, isShuffling, currentTrackIndex } = this.state;

		if (repeatMode === "single") {
			this.audioRef.current.currentTime = 0;
			this.audioRef.current.play();
		} else if (isShuffling) {
			this.playShuffledTrack();
		} else if (repeatMode === "playlist" || currentTrackIndex < this.context.playList.length - 1) {
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

		if (currentTrackIndex < this.context.playList.length - 1) {
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
			randomIndex = Math.floor(Math.random() * this.context.playList.length);
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
		if (!this.context.playList[index]) return;

		const track = this.context.playList[index];
		this.setState({
			currentTrackIndex: index,
			currentTrack: track,
			isPlaying: true,
		});

		this.audioRef.current.src = this.context.getPreferredQualityURL(track.sources);
		this.audioRef.current.play();

		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: track.name || 'Unknown Title',
				artist: track.artist || 'Unknown Artist',
				artwork: [
					{ src: track.coverBg || './assets/images/icons/icon-512x512.png', sizes: '512x512', type: 'image/jpeg' }
    ]
			});
		}
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
		const updatedPlaylist = this.context.playList.filter((_, index) => index !== trackIndex);
		if (updatedPlaylist.length === 0) {
			this.resetAudio();
			this.setState({
				currentTrack: null,
				currentTrackIndex: null,
				isPlaying: false,
			});
			this.changePlayList([]);
		} else if (trackIndex === currentTrackIndex) {
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
			setTimeout(() => this.setTrack(newTrackIndex), 100);
		} else {
			const newTrackIndex =
				trackIndex <= currentTrackIndex ? Math.max(currentTrackIndex - 1, 0) : currentTrackIndex;
			this.setState({
				currentTrackIndex: newTrackIndex,
			});
			this.changePlayList(updatedPlaylist);
			setTimeout(() => this.setTrack(newTrackIndex), 100);
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
		<div
			className={`flex-shrink-0 bg-neutral-50 rounded-t-xl absolute z-30 left-0 bottom-0 ${
				isExpanded ? "animate-expand-height h-full md:h-96" : "animate-shrink-height"
			} max-w-md w-full border-t border-neutral-200 overflow-auto`}
			aria-live="polite"
		>
			<audio ref={this.audioRef} aria-hidden="true" />
			<div
				key="collapsed"
				className={`${
					isExpanded ? "hidden" : "flex"
				} animate-fade-in relative w-full flex-row items-center p-2 gap-2`}
			>
				<div
					className="absolute -z-10 bottom-0 left-0 h-2 bg-pink-400 blur-md translate-y-1/2"
					style={{ width: `${(currentTime / totalDuration) * 100}%` }}
					aria-hidden="true"
				></div>
				<div
					className={`flex-shrink-0 w-10 h-10 rounded-md overflow-hidden ${
						isBuffering ? "border-2 border-yellow-400" : ""
					} transition duration-800`}
					aria-label="Track Thumbnail"
				>
					<img
						src={
							currentTrack
								? currentTrack.coverSm
								: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDxCMxWS-wIcqPV6tR3zRAe8a-OFaHJt0AtFvJX5UpYJ9lf4mvfxWVHCA&s=10"
						}
						alt={currentTrack ? currentTrack.name : "No Track"}
						className="object-cover"
					/>
				</div>
				<div className="min-w-0 grow">
					<h2 className="text-base text-neutral-800 font-medium leading-tight truncate" aria-live="assertive">
						{currentTrack ? renderText(currentTrack.name) : "No Track"}
					</h2>
					<p className="text-xs text-neutral-600 truncate" aria-hidden="true">
						{currentTrack ? renderText(currentTrack.artist) : ""}
					</p>
				</div>
				<div className="inline-flex gap-2">
					<button
						className="group size-8 rounded-full bg-neutral-100 flex justify-center items-center text-neutral-700 hover:bg-yellow-400 transition-all"
						onClick={this.togglePlayPause}
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						<i className={`fa-solid fa-${isPlaying ? "pause" : "play ml-0.5"} group-hover:text-neutral-100`} />
					</button>
					<button
						className="group size-8 rounded-full bg-neutral-100 flex justify-center items-center text-neutral-700 hover:bg-yellow-400 transition-all"
						onClick={this.playNextTrack}
						aria-label="Play next track"
					>
						<i className="fa-solid fa-forward-step group-hover:text-neutral-100" />
					</button>
					<button
						className="group size-8 rounded-full bg-neutral-100 flex justify-center items-center text-neutral-700 hover:bg-yellow-400 transition-all"
						onClick={this.handleExpand}
						aria-label="Expand player"
					>
						<i className="fa-solid fa-chevron-up group-hover:text-neutral-100" />
					</button>
				</div>
			</div>

			<div key="expanded" className={`${isExpanded ? "" : "hidden"} animate-fade-in w-full p-3`} aria-hidden={!isExpanded}>
				<button
					className="ml-auto group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all"
					onClick={this.handleExpand}
					aria-label="Collapse player"
				>
					<i className="fa-solid fa-chevron-down text-neutral-700 group-hover:text-neutral-100" />
				</button>
				<div className="w-full mt-6">
					<div
						className={`relative size-52 rounded-2xl mx-auto mb-4 ${
							isBuffering ? "border-4 border-yellow-400" : ""
						} transition duration-800`}
					>
						<img
							src={
								currentTrack
									? currentTrack.coverBg
									: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDxCMxWS-wIcqPV6tR3zRAe8a-OFaHJt0AtFvJX5UpYJ9lf4mvfxWVHCA&s=10"
							}
							alt={currentTrack ? currentTrack.name : "No Track"}
							className="size-full absolute top-0 object-cover rounded-xl blur-xl"
							aria-hidden="true"
						/>
						<img
							src={
								currentTrack
									? currentTrack.coverBg
									: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDxCMxWS-wIcqPV6tR3zRAe8a-OFaHJt0AtFvJX5UpYJ9lf4mvfxWVHCA&s=10"
							}
							alt={currentTrack ? currentTrack.name : "No Track"}
							className="size-full absolute top-0 object-cover rounded-xl overflow-hidden"
							aria-hidden="true"
						/>
					</div>
					<div className="flex flex-col items-center">
						<h2 className="max-w-72 text-neutral-800 inline-block text-lg font-medium leading-tight truncate" aria-live="assertive">
							{currentTrack ? renderText(currentTrack.name) : "No Track"}
						</h2>
						<span className="text-sm text-neutral-600" aria-hidden="true">
							{currentTrack ? renderText(currentTrack.artist) : ""}
						</span>
						<div className="w-72 mt-4">
							<input
								type="range"
								min="0"
								max={totalDuration}
								value={currentTime}
								className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
								onInput={this.seekTrack}
								aria-label="Seek track"
								aria-valuemin="0"
								aria-valuemax={totalDuration}
								aria-valuenow={currentTime}
							/>
						</div>
						<div className="text-xs text-neutral-500 flex justify-between w-72 mt-1">
							<span>{this.formatTime(currentTime)}</span>
							<span>{this.formatTime(totalDuration)}</span>
						</div>
						<div className="inline-flex flex-row justify-center items-center gap-4 mt-2">
							<button
								className="text-lg p-2"
								onClick={this.toggleRepeatMode}
								aria-label={`Repeat mode: ${repeatMode}`}
							>
								<i
									className={`fa-solid fa-${
										repeatMode === "single"
											? "repeat text-blue-400"
											: repeatMode === "playlist"
											? "infinity text-blue-400"
											: "repeat text-neutral-700"
									}`}
								/>
							</button>
							<button
								className="text-xl text-neutral-700 p-2"
								onClick={this.playPreviousTrack}
								aria-label="Previous track"
							>
								<i className="fa-solid fa-backward-step" />
							</button>
							<button
								className="text-4xl p-3 text-yellow-400"
								onClick={this.togglePlayPause}
								aria-label={isPlaying ? "Pause track" : "Play track"}
							>
								<i className={`fa-solid fa-${isPlaying ? "pause" : "play"}-circle`} />
							</button>
							<button
								className="text-xl text-neutral-700 p-2"
								onClick={this.playNextTrack}
								aria-label="Next track"
							>
								<i className="fa-solid fa-forward-step" />
							</button>
							<button
								className="text-lg text-neutral-700 p-2"
								onClick={this.toggleShuffle}
								aria-label={`Shuffle: ${isShuffling ? "On" : "Off"}`}
							>
								<i
									className={`fa-solid fa-shuffle ${isShuffling ? "text-blue-400" : ""}`}
								/>
							</button>
						</div>
					</div>
				</div>
				<div className="w-full mt-2">
					<h2 className="text-sm font-medium text-neutral-800 mb-2">QUEUE</h2>
					<ul className="w-full flex flex-col gap-1">
						{this.context.playList.length ? (
							this.context.playList.map((track, index) => (
								<li
									key={track.id}
									className={`group px-3 py-2 flex flex-row items-center gap-3 rounded-lg ${this.state.currentTrackIndex === index ? "border-2 border-yellow-400 hover:border-yellow-500" : "hover:bg-neutral-200/50"} transition-colors duration-500 cursor-pointer`}
									onClick={() => this.setTrack(index)}
									aria-label={`Select ${track.name}`}
								>
									<img
										src={
											track
												? track.coverSm
												: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDxCMxWS-wIcqPV6tR3zRAe8a-OFaHJt0AtFvJX5UpYJ9lf4mvfxWVHCA&s=10"
										}
										alt={`Track Thumbnail ${track.name}`}
										className="w-8 h-8 rounded-md"
									/>
									<div className="min-w-0 grow flex flex-col">
										<h3 className="text-sm text-neutral-800 font-normal leading-tight truncate" aria-hidden="true">
											{renderText(track.name)}
										</h3>
										<span className="text-xs font-light text-neutral-600 leading-none truncate" aria-hidden="true">
											{renderText(track.artist)}
										</span>
									</div>
									<span
										className="size-8 fa-solid fa-times flex justify-center items-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-red-400 hover:text-neutral-100 transition-all"
										onClick={(e) => {
											e.stopPropagation();
											this.removeTrack(index);
										}}
										aria-label={`Remove ${track.name} from playlist`}
									/>
								</li>
							))
						) : (
							<li className="px-3 py-2 flex flex-row items-center gap-3 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer">
								<div className="grow flex flex-col">
									<h3 className="text-sm text-neutral-600 font-normal leading-tight truncate">Nothing in your playlist!</h3>
									<span className="text-xs text-neutral-400 leading-none truncate">Go find some songs to enjoy.</span>
								</div>
							</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
}
}

export default Player;