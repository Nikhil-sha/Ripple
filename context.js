import { secureURL, toPlusConv, parseLRC } from './utilities/all.js';

export const AppContext = createContext();

export class AppProvider extends Component {
	state = {
		lyricsDump: [],
		limitForSaved: 150,
		homeSuggestions: {
			pickedSong: null,
			songs: null,
			playlists: null
		},
		search: {
			query: null,
			results: [],
			lastPageIndex: Infinity,
		},
		specificSongDetails: null,
		specificPlaylistDetails: null,
		specificAlbumDetails: null,
		specificArtistDetails: null,
		savedTracks: [],
		playList: [],
		preferredQuality: null,
		searchResultsLimit: null,
		playerMethods: {},
		downloadMethod: null,
		downloadDir: null,
		downloadedFiles: [],
		setOptions: null
	};
	
	endpoints = {
		search: {
			songs: "https://jiosavan-api2.vercel.app/api/search/songs",
			lyrics: "https://lrclib.net/api/search",
			playlists: "https://jiosavan-api2.vercel.app/api/search/playlists"
		},
		songs: "https://jiosavan-api2.vercel.app/api/songs",
		artists: "https://jiosavan-api2.vercel.app/api/artists",
		albums: "https://jiosavan-api2.vercel.app/api/albums",
		playlists: "https://jiosavan-api2.vercel.app/api/playlists",
	};
	
	lyricsAbortController = null;
	
	setPlayerMethods = (methods) => {
		this.setState((prevState) => ({
			playerMethods: { ...prevState.playerMethods, ...methods },
		}));
	};
	
	setDownloadMethod = (method) => {
		this.setState({
			downloadMethod: method,
		});
	};
	
	setOptionsMethod = (method) => {
		this.setState({
			setOptions: method,
		});
	};
	
	requestNotificationPermission = async () => {
		if (!('Notification' in window)) {
			this.notify('error', 'Notification not supported!')
			return;
		}
		
		if (Notification.permission === 'granted') {
			return;
		}
		
		const permission = await Notification.requestPermission();
	};
	
	showSystemNotification = async (tag, title, body, image, actions, silent) => {
		await this.requestNotificationPermission();
		
		let serviceWorkerRegistration = null;
		if ('serviceWorker' in navigator) serviceWorkerRegistration = await navigator.serviceWorker.ready;
		
		if (serviceWorkerRegistration) {
			serviceWorkerRegistration.active.postMessage({
				type: 'NOTIFY',
				payload: {
					tag,
					title,
					body,
					image,
					actions,
					silent
				}
			})
		}
	};
	
	ensureDirectoryAccess = async () => {
		if (this.state.downloadDir) return;
		
		this.notify('warning', 'Requesting directory access...');
		this.setState({
			downloadDir: await window.showDirectoryPicker()
		});
		const permission = await this.state.downloadDir.requestPermission({ mode: 'readwrite' });
		if (permission !== 'granted') throw new Error('Permission not granted');
		this.notify('success', 'Directory ready.');
	}
	
	setSearchResultLimit = (limit) => {
		let final;
		
		if (limit === "stored") {
			final = localStorage.getItem("searchResultsLimit") || "5";
		} else {
			final = limit;
		}
		
		if (localStorage.getItem("searchResultsLimit") !== final) {
			localStorage.setItem("searchResultsLimit", final);
		}
		
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
		
		if (localStorage.getItem("preferredQuality") !== final) {
			localStorage.setItem("preferredQuality", final);
		}
		
		if (this.state.preferredQuality !== final) {
			this.setState({
				preferredQuality: final,
			});
		}
	};
	
	getPreferredQualityURL = (urlArray) => {
		if (!Array.isArray(urlArray) || urlArray.length === 0) {
			this.notify("error", "No sources found to play this song!");
			return null;
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
			newToast({ color: "green", text: message })
			navigator.vibrate(30);
		} else if (type === "error") {
			newToast({ color: "red", text: message })
			navigator.vibrate([30, 90, 50]);
		} else {
			newToast({ color: "yellow", text: message })
			navigator.vibrate([30, 90, 30]);
		}
	};
	
	updateSearchState = (query, results, lastPageIndex) => {
		if (this.state.search.query === query) {
			this.setState((prevState) => ({
				search: {
					...prevState.search,
					results: [...prevState.search.results, results],
					lastPageIndex
				},
			}));
		} else {
			this.setState({
				search: {
					query: query,
					results: [results],
					lastPageIndex
				},
			});
		}
	};
	
	setSpecificSongDetails = (newData) => {
		this.setState({
			specificSongDetails: newData,
		});
	};
	
	setSpecificPlaylistDetails = (newData) => {
		this.setState({
			specificPlaylistDetails: newData,
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
	
	getLrcLibLyrics = async (trackName, artistName) => {
		if (!trackName || !artistName) return;
		
		if (this.lyricsAbortController) {
			this.lyricsAbortController.abort();
		}
		
		this.lyricsAbortController = new AbortController();
		const { signal } = this.lyricsAbortController;
		const response = await fetch(`${this.endpoints.search.lyrics}?track_name=${toPlusConv(trackName)}&artist_name=${toPlusConv(artistName)}`, { signal });
		if (!response.ok) throw new Error("Network Error");
		const results = await response.json();
		
		let data;
		if (results || !results.length === 0) {
			const sorted = [...results].filter(e => e.syncedLyrics)?.sort((a, b) => {
				const durA = a.duration || 0;
				const durB = b.duration || 0;
				return durA - durB;
			});
			
			if (!sorted || sorted.length === 0) {
				data = null;
			} else {
				const mid = Math.floor(sorted.length / 2);
				data = sorted[mid].syncedLyrics;
			}
		} else {
			data = null;
		}
		
		const final = {
			name: trackName,
			artist: artistName,
			synced: data ? parseLRC(data) : "NotFound"
		};
		this.setState((prevState) => ({
			lyricsDump: [...prevState.lyricsDump, final]
		}));
		
		return final;
	};
	
	searchLyricsDump = async (trackName, artistName) => {
		const result = this.state.lyricsDump.find(e =>
			e.name === trackName &&
			e.artist === artistName
		);
		
		if (!result) {
			const fetched = await this.getLrcLibLyrics(trackName, artistName);
			return fetched;
		}
		
		return result;
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
		
		sessionStorage.setItem('playlist', JSON.stringify(filteredPlayList));
		
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
	
	loadDownloadedFiles = async () => {
		await this.ensureDirectoryAccess();
		
		const m4aFiles = [];
		for await (const entry of this.state.downloadDir.values()) {
			if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.m4a')) {
				m4aFiles.push(entry);
			}
		}
		
		this.setState({
			downloadedFiles: m4aFiles
		});
	}
	
	setSuggestions = (type, results) => {
		switch (type) {
			case 'songs':
				this.setState((prevState) => ({
					homeSuggestions: { ...prevState.homeSuggestions, songs: results },
				}));
				break;
				
			case 'playlists':
				this.setState((prevState) => ({
					homeSuggestions: { ...prevState.homeSuggestions, playlists: results },
				}));
				break;
		}
	};
	
	setPickedForSuggestion = (song) => {
		this.setState((prevState) => ({
			homeSuggestions: { ...prevState.homeSuggestions, pickedSong: song },
		}));
	};
	
	render() {
		return (
			e(
				AppContext.Provider,
				{
					value: {
						...this.state,
						endpoints: this.endpoints,
						notify: this.notify,
						setSuggestions: this.setSuggestions,
						setPickedForSuggestion: this.setPickedForSuggestion,
						setSearchResultLimit: this.setSearchResultLimit,
						loadSavedTracks: this.loadSavedTracks,
						setPlayerMethods: this.setPlayerMethods,
						setDownloadMethod: this.setDownloadMethod,
						setOptionsMethod: this.setOptionsMethod,
						setPreferredQuality: this.setPreferredQuality,
						getPreferredQualityURL: this.getPreferredQualityURL,
						setSpecificSongDetails: this.setSpecificSongDetails,
						setSpecificPlaylistDetails: this.setSpecificPlaylistDetails,
						setSpecificAlbumDetails: this.setSpecificAlbumDetails,
						setSpecificArtistDetails: this.setSpecificArtistDetails,
						updateSearchState: this.updateSearchState,
						searchLyricsDump: this.searchLyricsDump,
						updatePlayList: this.updatePlayList,
						updateLocalStorage: this.updateLocalStorage,
						removeTrackFromLocalStorage: this.removeTrackFromLocalStorage,
						ensureDirectoryAccess: this.ensureDirectoryAccess,
						showSystemNotification: this.showSystemNotification,
						loadDownloadedFiles: this.loadDownloadedFiles,
					}
				},
				this.props.children
			)
		)
	}
}