import React, { createContext, Component } from 'react';
import { secureURL } from './components/utilities/all';

export const AppContext = createContext();

export class AppProvider extends Component {
	state = {
		limitForSaved: 150,
		homeSuggestion: {
			picked: null,
			results: null,
		},
		search: { query: null, results: null },
		specificSongLyrics: null,
		specificSongDetails: null,
		specificAlbumDetails: null,
		specificArtistDetails: null,
		savedTracks: [],
		playList: [],
		preferredQuality: null,
		searchResultsLimit: null,
		playerMethods: {},
	};

	endpoints = [
		{
			songs: "https://saavn.dev/api/songs",
			artists: "https://saavn.dev/api/artists",
			albums: "https://saavn.dev/api/albums"
		},
		{
			search: "https://jiosavan-api2.vercel.app/api/search/songs",
			songs: "https://jiosavan-api2.vercel.app/api/songs",
		}
	];

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
			this.notify("error", "No sources found to play this song!");
			return null; // Handle empty array case
		}

		const preferred = this.state.preferredQuality;

		const match = urlArray.find(urlObj => urlObj.quality === preferred);

		if (match) {
			return secureURL(match.url);
		} else {
			this.notify("warning", "No sources for preferred quality.")
			return secureURL(urlArray[urlArray.length - 1].url);
		}
	};

	notify = (type, message) => {
		const date = new Date();
		if (type === "success") {
			showPopup({ colour: "green", text: message })
			navigator.vibrate(40);
		} else if (type === "error") {
			showPopup({ colour: "red", text: message })
			navigator.vibrate([40, 100, 60]);
		} else {
			showPopup({ colour: "yellow", text: message })
			navigator.vibrate([40, 100, 40]);
		}
	};

	updateSearchState = (query, results) => {
		this.setState({
			search: {
				query: query,
				results: results,
			},
		});
	};

	setSpecificSongLyrics = (songId, songLyrics) => {
		this.setState({
			specificSongLyrics: { id: songId, lyrics: songLyrics },
		});
	};

	setSpecificSongDetails = (newData) => {
		this.setState({
			specificSongDetails: newData,
		});
	};

	setSpecificAlbumDetails = (newData) => {
		this.setState({
			specificAlbumDetails: newData,
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

		this.notify("success", "Playlist updated!");
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
			this.notify("error", "Limit to save songs reached! Please check your saved tracks.");
			return;
		}

		try {
			const isDuplicate = storedTrackList.some(track => track.id === newTrack.id);

			if (!isDuplicate) {
				const updatedTrackList = [newTrack, ...storedTrackList];
				localStorage.setItem("trackList", JSON.stringify(updatedTrackList));
				this.loadSavedTracks();
				this.notify("success", "Track saved and Local Storage updated!");
			} else {
				this.notify("warning", "Track already exists in the track list.");
			}
		} catch (error) {
			this.notify("error", "Error interacting with localStorage!");
		}
	};

	removeTrackFromLocalStorage = (songId) => {
		try {
			const storedTrackList = JSON.parse(localStorage.getItem("trackList") || []);
			const updatedTrackList = storedTrackList.filter(track => track.id !== songId);
			localStorage.setItem("trackList", JSON.stringify(updatedTrackList));
			this.loadSavedTracks();
			this.notify("success", "Track removed and Local Storage updated.");
		} catch (error) {
			this.notify("warning", "Error interacting with localStorage.");
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
					endpoints: this.endpoints,
					playerRef: this.playerRef,
					notify: this.notify,
					setHomeSuggestionResults: this.setHomeSuggestionResults,
					setHomeSuggestionPicked: this.setHomeSuggestionPicked,
					setSearchLimit: this.setSearchLimit,
					loadSavedTracks: this.loadSavedTracks,
					setPlayerMethods: this.setPlayerMethods,
					setPreferredQuality: this.setPreferredQuality,
					getPreferredQualityURL: this.getPreferredQualityURL,
					setSpecificSongLyrics: this.setSpecificSongLyrics,
					setSpecificSongDetails: this.setSpecificSongDetails,
					setSpecificAlbumDetails: this.setSpecificAlbumDetails,
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