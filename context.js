import React, { createContext, Component } from 'react';

// Create the context
export const AppContext = createContext();

// Create the Provider component
export class AppProvider extends Component {
	state = {
		isAsideVisible: false,
		isPopupVisible: false,
		notifications: [],
		search: { query: null, results: null },
		specificSongDetails: null,
		savedTracks: [],
		playList: [],
		playerMethods: {}
	};

	setPlayerMethods = (methods) => {
		this.setState((prevState) => ({
			playerMethods: { ...prevState.playerMethods, ...methods },
		}));
	};

	handleAsideToggle = () => {
		this.setState((prevState) => ({
			isAsideVisible: !prevState.isAsideVisible,
		}));
	};

	addToNotification = (type, message) => {
		const date = new Date();
		this.setState((prevState) => ({
			notifications: [{ type: type, text: message, time: date.toLocaleString() }, ...prevState.notifications],
		}));
		this.showPopup();
	};

	showPopup = () => {
		this.setState({
			isPopupVisible: true,
		});

		setTimeout(() => {
			this.setState({
				isPopupVisible: false,
			});
		}, 4000);
	};

	updateSearchState = (query, results) => {
		this.setState({
			search: {
				query: query,
				results: results,
			},
		});
	};

	setSpecificSongDetails = (newData) => {
		this.setState({
			specificSongDetails: newData,
		});
	};

	updatePlayList = (newPlayList) => {
		let prevLength = this.state.playList.length;
		const uniqueTrackIds = new Set();
		const filteredPlayList = newPlayList.filter(track => {
			if (!uniqueTrackIds.has(track.id)) {
				uniqueTrackIds.add(track.id);
				return true;
			}
			return false;
		});

		this.setState({
			playList: filteredPlayList,
		});

		const { setTrack } = this.state.playerMethods;
		let newLength = filteredPlayList.length;
		if (!setTrack) {
			return;
		} else if (newLength > prevLength) {
			setTimeout(() => {
				setTrack(0);
			}, 500);
		}

		this.addToNotification("success", "Playlist updated!");
	};

	loadSavedTracks = () => {
		const savedTracksInStorage = JSON.parse(localStorage.getItem("trackList"));
		if (savedTracksInStorage) {
			this.setState({
				savedTracks: savedTracksInStorage,
			});
		}
	};

	updateLocalStorage = (newTrack) => {
		try {
			const storedTrackList = JSON.parse(localStorage.getItem("trackList")) || [];
			const isDuplicate = storedTrackList.some(track => track.id === newTrack.id);

			if (!isDuplicate) {
				const updatedTrackList = [newTrack, ...storedTrackList];
				localStorage.setItem("trackList", JSON.stringify(updatedTrackList));
				this.loadSavedTracks();
				this.addToNotification("success", "Track saved and Local Storage updated!");
			} else {
				this.addToNotification("warning", "Track already exists in the track list.");
			}
		} catch (error) {
			this.addToNotification("error", "Error interacting with localStorage!");
		}
	};

	removeTrackFromLocalStorage = (songId) => {
		try {
			const storedTrackList = JSON.parse(localStorage.getItem("trackList")) || [];
			const updatedTrackList = storedTrackList.filter(track => track.id !== songId);
			localStorage.setItem("trackList", JSON.stringify(updatedTrackList));
			this.loadSavedTracks();

			this.addToNotification("success", "Track removed and Local Storage updated.");
		} catch (error) {
			this.addToNotification("warning", "Error interacting with localStorage.");
		}
	};

	render() {
		return (
			<AppContext.Provider
				value={{
					...this.state,
					playerRef: this.playerRef,
					handleAsideToggle: this.handleAsideToggle,
					addToNotification: this.addToNotification,
					showPopup: this.showPopup,
					loadSavedTracks: this.loadSavedTracks,
					setPlayerMethods: this.setPlayerMethods,
					setSpecificSongDetails: this.setSpecificSongDetails,
					updateSearchState: this.updateSearchState,
					updatePlayList: this.updatePlayList,
					updateLocalStorage: this.updateLocalStorage,
					removeTrackFromLocalStorage: this.removeTrackFromLocalStorage,
				}}
			>
				{this.props.children}
			</AppContext.Provider>
		);
	}
}