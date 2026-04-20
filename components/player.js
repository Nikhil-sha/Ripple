import React, { Component, createRef } from "react";
import { AppContext } from '../context';
import { renderText, formatTime } from '../utilities/all';

import Button from './button';

class Player extends Component {
	static contextType = AppContext;
	
	state = {
		isExpanded: false,
		isPlaying: false,
		isBuffering: false,
		currentTime: 0,
		totalDuration: 0,
		currentTrackIndex: 0,
		repeatMode: "playlist",
		isShuffling: false,
		currentTrack: null,
	};
	
	audioRef = createRef();

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
			
			navigator.mediaSession.setActionHandler('seekto', (details) => {
				this.audioRef.current.currentTime = details.seekTime;
			});
			
			navigator.mediaSession.setActionHandler('stop', () => {
				this.resetAudio();
			});
		}
		
		const sessionPlaylist = JSON.parse(sessionStorage.getItem('playlist'));
		if (sessionPlaylist && sessionPlaylist.length) {
			this.context.notify('warning', 'Loading playlist from Session Storage!');
			this.context.updatePlayList(sessionPlaylist);
			setTimeout(() => {
				this.setTrack(0);
				this.togglePlayPause();
			}, 1000);
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

	setMSMetaData = (track) => {
		if (!'mediaSession' in navigator) return;
		
		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.name || 'Unknown Title',
			artist: track.artist || 'Unknown Artist',
			album: track.album || "Unknown Album",
			artwork: [{ src: track.coverBg || './assets/images/icons/icon-512x512.png', sizes: '512x512', type: 'image/jpeg' }]
		});
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
		navigator.mediaSession.playbackState = "paused";
	};

	handlePlaying = () => {
		this.setState({ isPlaying: true });
		navigator.mediaSession.playbackState = "playing";
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
		const { currentTrackIndex, repeatMode } = this.state;

		if (currentTrackIndex > 0) {
			this.setTrack(currentTrackIndex - 1);
		} else if (repeatMode === "playlist") {
			this.setTrack(this.context.playList.length - 1);
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

		this.setMSMetaData(track);
	};
	
	shareTrack = async () => {
		if (!'share' in navigator) {
			this.context.notify('error', "Sharing is not supported on this device!");
		}
		if (!this.context.playList[this.state.currentTrackIndex]) return;
		
		const trackToShare = this.context.playList[this.state.currentTrackIndex];
		
		try{
			const title = "Listen on Ripple!";
			const text = `${trackToShare.name}\nArtist: ${trackToShare.artist}\nAlbum: ${trackToShare.album}\n`;
			const url = `https://nikhil-sha.github.io/Ripple/#/song/${trackToShare.id}`;
			
			await navigator.share({ title, text, url });
		} catch (err) {
			this.context.notify('error', err.message)
		}
	};
	
	saveTrack = () => {
		if (!this.context.playList[this.state.currentTrackIndex]) return;
		
		const trackToSave = this.context.playList[this.state.currentTrackIndex];
		this.context.updateLocalStorage(trackToSave);
	};
	
	downloadTrack = async (indexToDownload) => {
		if (!this.context.playList[indexToDownload]) return;

		const trackToDownload = this.context.playList[indexToDownload];
		this.context.downloadMethod(trackToDownload);
	};

	seekTrack = (event) => {
		this.audioRef.current.currentTime = event.currentTarget.value;
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
		
		navigator.mediaSession.playbackState = "none";
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
		trackPalette
	} = this.state;

	return (
		<div
			className={`flex-shrink-0 bg-neutral-900 absolute z-50 left-0 bottom-0 ${
				isExpanded ? "animate-expand-height h-full md:h-96" : "animate-shrink-height rounded-t-xl border-t"
			} max-w-md w-full border-neutral-800 bg-center bg-cover bg-no-repeat transition-[background] duration-500 overflow-hidden`}
			aria-live="polite"
			style={{ backgroundImage: `url(${currentTrack ? currentTrack.coverSm : "https://picsum.photos/80.webp?blur=8"})` }}
		>
			<audio ref={this.audioRef} aria-hidden="true" />
			<div
				key="collapsed"
				className={`${
					isExpanded ? "hidden" : "flex"
				} relative bg-neutral-950/75 backdrop-blur-2xl w-full h-full flex-row items-center p-2 gap-3`}
			>
				<div
					className={`flex-shrink-0 size-11 rounded-xl overflow-hidden border-yellow-400 ${
						isBuffering ? "border-2 animate-pulse" : ""
					} transition duration-800`}
					aria-label="Track Thumbnail"
				>
					<img
						src={
							currentTrack
								? currentTrack.coverSm
								: "https://picsum.photos/80.webp?blur=8"
						}
						alt={currentTrack ? currentTrack.name : "No Track"}
						className="object-cover"
					/>
				</div>
				
				<div className="min-w-0 grow">
					<h2 className="text-base text-neutral-200 font-medium leading-tight truncate" aria-live="assertive">
						{currentTrack ? renderText(currentTrack.name) : "No Track"}
					</h2>
					<p className="text-xs text-neutral-400 truncate" aria-hidden="true">
						{currentTrack ? renderText(currentTrack.artist) : "Play some songs…"}
					</p>
				</div>
				
				<div className="inline-flex gap-2">
				  <Button accent="yellow" roundness="full" icon={isPlaying ? "pause" : "play ml-0.5"} label={isPlaying ? "Pause" : "Play"} clickHandler={this.togglePlayPause} />
				  <Button accent="yellow" roundness="full" icon="forward-step" label="Play next track" clickHandler={this.playNextTrack} />
				  <Button accent="yellow" roundness="full" icon="chevron-up" label="Expand player" clickHandler={this.handleExpand} />
				</div>
				
				<div
					className="absolute bottom-0 left-0 -z-10 h-0.5 bg-blue-400"
					style={{ width: `${(currentTime / totalDuration) * 100}%` }}
					aria-hidden="true"
				></div>
			</div>

			<div key="expanded" className={`${isExpanded ? "" : "hidden"} bg-neutral-950/75 backdrop-blur-2xl w-full h-full p-3 overflow-y-auto`} aria-hidden={!isExpanded}>
				<button
					className="mx-auto h-8 w-14 flex justify-center items-center rounded-full bg-neutral-800/40 hover:bg-neutral-800/60 transition-colors duration-500"
					onClick={this.handleExpand}
					aria-label="Collapse player"
				>
					<i className="text-neutral-400 fa-solid fa-chevron-down"></i>
				</button>
				<div className="w-full mt-6">
					<div
						className="relative size-64 rounded-4xl mx-auto mb-6"
					>
						<img
							src={
								currentTrack
									? currentTrack.coverBg
									: "https://picsum.photos/80.webp?blur=8"
							}
							alt={currentTrack ? currentTrack.name : "No Track"}
							className={`size-full absolute top-0 object-cover rounded-3xl border-yellow-400 ${isBuffering ? "border-4 animate-pulse" : ""} transition duration-800`}
							aria-hidden="true"
						/>
					</div>
					<div className="flex flex-col items-center">
						<div className="w-72 inline-flex justify-between items-center gap-2 mb-6">
							<span className="block w-7 text-xs text-center text-neutral-400">{formatTime(currentTime)}</span>
							<input
								type="range"
								min="0"
								max={totalDuration}
								value={currentTime}
								className="grow h-1.5 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-blue-400"
								onInput={this.seekTrack}
								aria-label="Seek track"
								aria-valuemin="0"
								aria-valuemax={totalDuration}
								aria-valuenow={currentTime}
							/>
							<span className="block w-7 text-xs text-center text-neutral-400">{formatTime(totalDuration)}</span>
						</div>
						
						<h2 className="max-w-72 text-neutral-200 inline-block text-lg font-medium leading-tight truncate" aria-live="assertive">
							{currentTrack ? renderText(currentTrack.name) : "No Track"}
						</h2>
						<span className="text-sm text-neutral-400" aria-hidden="true">
							{currentTrack ? renderText(currentTrack.artist) : ""}
						</span>
						
						<div className="inline-flex flex-row justify-center items-center gap-12 mt-6">
							<button
								className="text-2xl text-neutral-400 active:text-neutral-500 p-2"
								onClick={this.playPreviousTrack}
								aria-label="Previous track"
							>
								<i className="fa-solid fa-backward-step" />
							</button>
							<button
								className="text-5xl text-yellow-400 active:text-yellow-500"
								onClick={this.togglePlayPause}
								aria-label={isPlaying ? "Pause track" : "Play track"}
							>
								<i className={`fa-solid fa-${isPlaying ? "pause" : "play"}-circle`} />
							</button>
							<button
								className="text-2xl text-neutral-400 active:text-neutral-500 p-2"
								onClick={this.playNextTrack}
								aria-label="Next track"
							>
								<i className="fa-solid fa-forward-step" />
							</button>
						</div>
						
						<div className="inline-flex flex-row justify-center items-center gap-8 mt-4">
							<button
								className="text-neutral-400 active:text-neutral-500 p-1"
								onClick={this.toggleRepeatMode}
								aria-label={`Repeat mode: ${repeatMode}`}
							>
								<i
									className={`fa-solid fa-${
										repeatMode === "single"
											? "repeat text-blue-400"
											: repeatMode === "playlist"
											? "infinity text-blue-400"
											: "repeat text-neutral-400"
									}`}
								/>
							</button>
							<button
								className="text-neutral-400 active:text-neutral-500 p-1"
								onClick={this.toggleShuffle}
								aria-label={`Shuffle: ${isShuffling ? "On" : "Off"}`}
							>
								<i
									className={`fa-solid fa-shuffle ${isShuffling ? "text-blue-400" : ""}`}
								/>
							</button>
							<button
								className="text-neutral-400 active:text-neutral-500 p-1"
								onClick={this.saveTrack}
								aria-label="save"
							>
								<i
									className="fa-solid fa-heart"
								/>
							</button>
							<button
								className="text-neutral-400 active:text-neutral-500 p-1"
								onClick={this.shareTrack}
								aria-label="Share"
							>
								<i
									className="fa-solid fa-share"
								/>
							</button>
						</div>
					</div>
				</div>
				<div className="w-full mt-2">
					<h3 className="text-sm font-medium text-neutral-400 mb-2">QUEUE</h3>
					<ul className="w-full flex flex-col gap-1">
						{this.context.playList.length ? (
							this.context.playList.map((track, index) => (
								<li
									key={track.id}
									className={`px-3 py-2 flex flex-row items-center gap-3 rounded-xl border-yellow-400 ${this.state.currentTrackIndex === index ? "border " : ""}hover:bg-neutral-700/50 transition-colors duration-500 cursor-pointer`}
									onClick={() => this.setTrack(index)}
									aria-label={`Select ${track.name}`}
								>
									<img
										src={
											track
												? track.coverSm
												: "https://picsum.photos/80.webp?blur=8"
										}
										alt={`Track Thumbnail ${track.name}`}
										className="w-8 h-8 rounded-lg"
									/>
									<div className="min-w-0 grow inline-flex flex-col">
										<h3 className="text-sm text-neutral-200 font-normal leading-tight truncate" aria-hidden="true">
											{renderText(track.name)}
										</h3>
										<span className="text-xs font-light text-neutral-400 leading-tight truncate" aria-hidden="true">
											{renderText(track.artist)}
										</span>
									</div>
									<Button accent="yellow" roundness="full" icon="download" label={`Download ${track.name}`} clickHandler={(e) => {e.stopPropagation();this.downloadTrack(index);}} />
									<Button accent="yellow" roundness="full" icon="times" label={`Remove ${track.name} from queue`} clickHandler={(e) => {e.stopPropagation();this.removeTrack(index);}} />
								</li>
							))
						) : (
							<li className="px-3 py-2 flex flex-row items-center gap-3 rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer">
								<div className="grow flex flex-col">
									<h3 className="text-sm text-neutral-200 font-normal leading-tight truncate">Nothing in your playlist!</h3>
									<span className="text-xs text-neutral-400 leading-tight truncate">Go find some songs to enjoy.</span>
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