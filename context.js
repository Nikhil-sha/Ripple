import { secureURL } from './utilities/all.js';

export const AppContext = createContext();

export class AppProvider extends Component {
  state = {
    limitForSaved: 150,
    homeSuggestion: {
      picked: null,
      results: null,
    },
    search: {
      query: null,
      results: [],
      lastPageIndex: Infinity,
    },
    specificSongLyrics: null,
    specificSongDetails: null,
    specificAlbumDetails: null,
    specificArtistDetails: null,
    savedTracks: [],
    playList: [],
    preferredQuality: null,
    searchResultsLimit: null,
    playerMethods: {},
    downloadMethod: null,
    downloadDir: null,
    downloadedFiles: []
  };
  
  endpoints = {
    search: "https://jiosavan-api2.vercel.app/api/search/songs",
    songs: "https://jiosavan-api2.vercel.app/api/songs",
    artists: "https://jiosavan-api2.vercel.app/api/artists",
    albums: "https://jiosavan-api2.vercel.app/api/albums",
  };
  
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
    
    console.log(m4aFiles);
    
    this.setState({
      downloadedFiles: m4aFiles
    });
  }
  
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
      e(
        AppContext.Provider,
        {
          value: {
            ...this.state,
            endpoints: this.endpoints,
            notify: this.notify,
            setHomeSuggestionResults: this.setHomeSuggestionResults,
            setHomeSuggestionPicked: this.setHomeSuggestionPicked,
            setSearchResultLimit: this.setSearchResultLimit,
            loadSavedTracks: this.loadSavedTracks,
            setPlayerMethods: this.setPlayerMethods,
            setDownloadMethod: this.setDownloadMethod,
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