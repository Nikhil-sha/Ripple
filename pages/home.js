import { AppContext } from '../context.js';

import Song from '../components/song.js';
import Playlist from '../components/playlist.js';
import Button from '../components/button.js';
import { renderText } from '../utilities/all.js';
import ErrorCard from '../components/error.js';
import LoadingSongs from '../components/loadings/loadingSongs.js';

class Home extends Component {
	static contextType = AppContext;
	
	static navOptions = [
		{ icon: 'search', label: 'Search', path: '/search', color: 'yellow' },
		{ icon: 'heart', label: 'Saved', path: '/saved', color: 'blue' },
		{ icon: 'gear', label: 'Settings', path: '/settings', color: 'rose' },
		{ icon: 'download', label: 'Downloads', path: '/downloads', color: 'emerald' }
	];
	
	static playlistGenreList = [
		"Hindi",
		"English",
		"International",
		"Pop",
		"Pop English",
		"Pop International",
		"Hits",
		"Hits English",
		"Hits International",
		"Sad",
		"Sad English",
		"Sad International",
		"Romantic",
		"Romantic English",
		"Romantic International",
		"Disco",
		"Disco English",
		"Disco International",
		"Indie",
		"Indie English",
		"Indie International"
	];
	
	constructor(props) {
		super(props);
		this.state = {
			loadingSongs: false,
			songsError: false,
			songsErrorMessage: null,
			loadingPlaylists: false,
			playlistsError: false,
			playlistsErrorMessage: null,
		};
		this.abortController = {
			song: null,
			playlist: null
		};
	}
	
	async componentDidMount() {
		const savedTracks = await this.context.loadSavedTracks();
		if (this.shouldFetchSongSuggestion(savedTracks)) this.pickRandomSongAndFetch(savedTracks);
		if (this.shouldFetchPlaylistSuggestion()) this.fetchPlaylistSuggestion();;
	}
	
	componentWillUnmount() {
		if (this.abortController.song) {
			this.abortController.song.abort();
		}
		
		if (this.abortController.playlist) {
			this.abortController.playlist.abort();
		}
	}
	
	setLoading = (target, bool) => {
		switch (target) {
			case 'songs':
				this.setState({ loadingSongs: bool });
				break;
				
			case 'playlist':
				this.setState({ loadingPlaylists: bool });
				break;
		}
	};
	
	setError = (target, bool, message = "") => {
		switch (target) {
			case 'songs':
				this.setState({ songsError: bool, songsErrorMessage: message });
				break;
				
			case 'playlist':
				this.setState({ playlistsError: bool, playlistsErrorMessage: message });
				break;
		}
	};
	
	shouldFetchSongSuggestion = (savedTracks) => {
		return savedTracks && savedTracks.length > 0 &&
			((!this.context.homeSuggestions.songs) || this.context.homeSuggestions.songs.length === 0);
	}
	
	pickRandomSongAndFetch = (savedTracks) => {
		let randomPick = Math.floor(Math.random() * savedTracks.length);
		if (randomPick >= savedTracks.length) {
			randomPick -= 1;
		}
		
		const pickedSong = savedTracks[randomPick];
		if (!pickedSong || !pickedSong.id) {
			this.setError("songs", true, "Invalid song data!");
			return;
		}
		
		this.context.setPickedForSuggestion(pickedSong);
		this.fetchSongSuggestion(pickedSong.id);
	}
	
	refetchSongSuggestion = async () => {
		await this.context.loadSavedTracks();
		const { savedTracks } = this.context;
		this.pickRandomSongAndFetch(savedTracks);
	}
	
	fetchSongSuggestion = async (songId) => {
		if (this.abortController.song) this.abortController.song.abort();
		this.setLoading("songs", true);
		this.setError("songs", false);
		this.abortController.song = new AbortController();
		const { signal } = this.abortController.song;
		
		try {
			const { endpoints } = this.context;
			const apiUrl = `${endpoints.songs}/${songId}/suggestions?limit=20`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError("songs", true, data.message || "No suggestions found");
			} else {
				this.context.setSuggestions("songs", data.data);
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				this.setError("songs", true, error.message);
			}
		} finally {
			this.setLoading("songs", false);
		}
	};
	
	shouldFetchPlaylistSuggestion = (savedTracks) => {
		return ((!this.context.homeSuggestions.playlists) || (this.context.homeSuggestions.playlists.length === 0));
	}
	
	fetchPlaylistSuggestion = async () => {
		if (this.abortController.playlist) this.abortController.playlist.abort();
		
		this.setLoading("playlists", true);
		this.abortController.playlist = new AbortController();
		const { signal } = this.abortController.playlist;
		
		try {
			const query = this.context.homeSuggestions.pickedSong && Math.floor(Math.random()*2) ? this.context.homeSuggestions.pickedSong.artist : Home.playlistGenreList[Math.floor(Math.random() * Home.playlistGenreList.length)];
			const { endpoints } = this.context;
			const apiUrl = `${endpoints.search.playlists}?query=${encodeURIComponent(query)}&limit=15`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError("playlists", true, data.message || "No suggestions found");
			} else {
				const filtered = data.data.results.filter(item => item.image[1]?.url.startsWith("http"));
				this.context.setSuggestions("playlists", filtered);
				this.setLoading("playlists", false);
				this.setError("playlists", false);
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				this.setError("playlists", true, error.message);
			}
		}
	};
	
	render() {
		return (
			e("section", { className: "animate-fade-in-up min-h-0 w-full px-3 md:px-0 pt-4" },
				e("div", { className: "max-w-lg w-full mx-auto flex justify-between gap-4 mb-6" },
					Home.navOptions.map(({ icon, label, path, color }) =>
						e("div", { key: label, className: `flex-grow h-12 bg-${color}-400/20 rounded-2xl shadow-md` },
							e(Link, { to: path, className: "size-full flex flex-col justify-center items-center" },
								e("i", { className: `fa-solid fa-${icon} text-lg leading-tight text-${color}-400` })
							)
						)
					)
				),
				
				quoteData ? e("article", { className: "max-w-lg mx-auto w-full bg-neutral-800 rounded-2xl p-5 space-y-3 mb-6" },
					e("div", { className: "flex items-start space-x-2" },
						e("p", { className: "leading-snug text-neutral-200 text-sm" },
							e("i", { className: "mr-1 text-yellow-400" }, "“"),
							e("span", null, quoteData.quote),
							e("i", { className: "ml-1 text-yellow-400" }, "”")
						)
					),
					e("span", { className: "ml-auto block w-fit text-sm text-neutral-400" },
						quoteData.author
					)
				) : null,
				
				this.state.loadingPlaylists || this.state.playlistsError || this.context.homeSuggestions.playlists ?
				e("section", { className: "animate-fade-in w-full max-w-lg mx-auto flex flex-col justify-start items-center mb-6 gap-3" },
					e("div", { className: "w-full" },
						e("h2", { className: "w-full text-lg font-normal text-neutral-200 leading-snug" }, this.state.loadingPlaylists ? "Fetching suggestions…" : this.state.playlistsError ? 'Failed to load suggestions!' : 'Playlists for You'),
					),
					this.state.loadingPlaylists ? (
						e(LoadingSongs, { list: "5" })
					) : this.state.playlistsError ? (
						e(ErrorCard, { errorContext: this.state.playlistsErrorMessage })
					) : (
						e("div", { className: "w-full flex gap-3 overflow-x-auto" },
							this.context.homeSuggestions.playlists.map((playlist) =>
								e(Playlist, {
									key: playlist.id,
									id: playlist.id,
									name: playlist.name,
									cover: playlist.image[2].url,
								})
							)
						)
					)
				) : null,
				
				this.state.loadingSongs || this.state.songsError || this.context.homeSuggestions.songs ?
				e("section", { className: "animate-fade-in w-full max-w-lg mx-auto flex flex-col justify-start items-center gap-3" },
					e("div", { className: "w-full inline-flex justify-between items-center" },
						e("h2", { className: "w-full text-lg font-normal text-neutral-200 leading-snug" }, this.state.songsError ? 'Failed to load suggestions!' : this.state.loadingSongs ? "Fetching suggestions…" : `Since you liked ${this.context.homeSuggestions.pickedSong.name}`),
						e(Button, { accent: "yellow", icon: "rotate-right", roundness: "full", clickHandler: this.refetchSongSuggestion, label: "Reload suggestions" }),
					),
					this.state.songsError ? (
						e(ErrorCard, { errorContext: this.state.songsErrorMessage })
					) : this.state.loadingSongs ? (
						e(LoadingSongs, { list: "5" })
					) : (
						e("div", { className: "w-full flex flex-col justify-start items-center gap-2" },
							this.context.homeSuggestions.songs.map((song) =>
								e(Song, {
									key: song.id,
									id: song.id,
									name: renderText(song.name),
									artist: renderText(song.artists.primary[0].name),
									album: renderText(song.album.name),
									year: song.year,
									coverSm: song.image[1].url,
									coverBg: song.image[song.image.length - 1].url,
									sources: song.downloadUrl,
									option: "save"
								})
							)
						)
					)
				) : null
			)
		)
	}
}

export default Home;

// mia melano