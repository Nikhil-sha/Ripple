import React, { createContext, Component } from 'react';

// Create the context
export const AppContext = createContext();

// Create the Provider component
export class AppProvider extends Component {
	state = {
		limitForSaved: 150,
		isAsideVisible: false,
		isPopupVisible: false,
		notifications: [],
		homeSuggestion: {
			picked: null,
			results: null,
		},
		search: { query: null, results: null },
		specificSongDetails: null,
		specificArtistDetails: null,
		savedTracks: [],
		playList: [],
		preferredQuality: null,
		searchResultsLimit: null,
		playerMethods: {},
	};

	popupTimeout = null;

	setPlayerMethods = (methods) => {
		this.setState((prevState) => ({
			playerMethods: { ...prevState.playerMethods, ...methods },
		}));
	};

	setSearchLimit = (limit) => {
		let final;

		if (limit === "stored") {
			final = localStorage.getItem("searchResultsLimit") || "5";
		} else {
			final = limit;
		}

		// Update localStorage only if different
		if (localStorage.getItem("searchResultsLimit") !== final) {
			localStorage.setItem("searchResultsLimit", final);
		}

		// Update state only if different
		if (this.state.searchResultsLimit !== final) {
			this.setState({
				searchResultsLimit: final,
			});
		}
	};

	setPreferredQuality = (quality) => {
		let final;

		if (quality === "stored") {
			final = localStorage.getItem("preferredQuality") || "160kbps";
		} else {
			final = quality;
		}

		// Update localStorage only if different
		if (localStorage.getItem("preferredQuality") !== final) {
			localStorage.setItem("preferredQuality", final);
		}

		// Update state only if different
		if (this.state.preferredQuality !== final) {
			this.setState({
				preferredQuality: final,
			});
		}
	};

	getPreferredQualityURL = (urlArray) => {
		if (!Array.isArray(urlArray) || urlArray.length === 0) {
			this.addToNotification("error", "No sources found to play this song!");
			return null; // Handle empty array case
		}

		const preferred = this.state.preferredQuality;

		const match = urlArray.find(urlObj => urlObj.quality === preferred);

		if (match) {
			return match.url;
		} else {
			this.addToNotification("warning", "No sources for preferred quality.")
			return urlArray[urlArray.length - 1].url;
		}
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
		if (type === "success") {
			navigator.vibrate(40);
		} else if (type === "error") {
			navigator.vibrate([40, 100, 60]);
		} else {
			navigator.vibrate([40, 100, 40]);
		}
	};

	showPopup = () => {
		this.setState({
			isPopupVisible: true,
		});

		if (this.popupTimeout) {
			clearTimeout(this.popupTimeout);
			this.popupTimeout = null;
		}

		this.popupTimeout = setTimeout(() => {
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

	setSpecificArtistDetails = (newData) => {
		this.setState({
			specificArtistDetails: newData,
		});
	};

	updatePlayList = (newPlayList) => {
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

		this.addToNotification("success", "Playlist updated!");
	};

	loadSavedTracks = () => {
		return new Promise((resolve) => {
			const savedTracksInStorage = JSON.parse(localStorage.getItem("trackList"));
			if (savedTracksInStorage) {
				this.setState({ savedTracks: savedTracksInStorage }, () => {
					resolve(savedTracksInStorage);
				});
			} else {
				resolve(null);
			}
		});
	};

	updateLocalStorage = (newTrack) => {
		const storedData = localStorage.getItem("trackList");
		const storedTrackList = storedData ? JSON.parse(storedData) : []; // Ensure an array

		if (storedTrackList.length >= this.state.limitForSaved) {
			this.addToNotification("error", "Limit to save songs reached! Please check your saved tracks.");
			return;
		}

		try {
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
			const storedTrackList = JSON.parse(localStorage.getItem("trackList") || []);
			const updatedTrackList = storedTrackList.filter(track => track.id !== songId);
			localStorage.setItem("trackList", JSON.stringify(updatedTrackList));
			this.loadSavedTracks();

			this.addToNotification("success", "Track removed and Local Storage updated.");
		} catch (error) {
			this.addToNotification("warning", "Error interacting with localStorage.");
		}
	};

	setHomeSuggestionResults = (results) => {
		this.setState((prevState) => ({
			homeSuggestion: { picked: prevState.homeSuggestion.picked, results: results },
		}));
	};

	setHomeSuggestionPicked = (song) => {
		this.setState({
			homeSuggestion: { picked: song, results: null },
		});
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
					setHomeSuggestionResults: this.setHomeSuggestionResults,
					setHomeSuggestionPicked: this.setHomeSuggestionPicked,
					setSearchLimit: this.setSearchLimit,
					loadSavedTracks: this.loadSavedTracks,
					setPlayerMethods: this.setPlayerMethods,
					setPreferredQuality: this.setPreferredQuality,
					getPreferredQualityURL: this.getPreferredQualityURL,
					setSpecificSongDetails: this.setSpecificSongDetails,
					setSpecificArtistDetails: this.setSpecificArtistDetails,
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