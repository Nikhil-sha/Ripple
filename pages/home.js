import { AppContext } from '../context.js';

import Song from '../components/song.js';
import Button from '../components/button.js';
import { renderText } from '../utilities/all.js';
import ErrorCard from '../components/error.js';
import LoadingSongs from '../components/loadings/loadingSongs.js';

class Home extends Component {
	static contextType = AppContext;
	
	static navOptions = [
		{ icon: 'user', label: 'About', path: '/about', color: 'cyan' },
		{ icon: 'search', label: 'Search', path: '/search', color: 'yellow' },
		{ icon: 'heart', label: 'Saved', path: '/saved', color: 'blue' },
		{ icon: 'gear', label: 'Settings', path: '/settings', color: 'rose' },
		{ icon: 'download', label: 'Downloads', path: '/downloads', color: 'emerald' }
	];
	
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			errorMessage: null,
		};
		this.abortController = null;
	}
	
	async componentDidMount() {
		const savedTracks = await this.context.loadSavedTracks();
		if (!this.shouldFetchSuggestion(savedTracks)) {
			return;
		}
		
		this.pickRandomSongAndFetch(savedTracks);
	}
	
	componentWillUnmount() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}
	
	shouldFetchSuggestion = (savedTracks) => {
		return savedTracks && savedTracks.length > 0 &&
			(!this.context.homeSuggestion.results || this.context.homeSuggestion.results.length === 0);
	}
	
	pickRandomSongAndFetch = (savedTracks) => {
		let randomPick = Math.floor(Math.random() * savedTracks.length);
		if (randomPick >= savedTracks.length) {
			randomPick -= 1;
		}
		
		const pickedSong = savedTracks[randomPick];
		if (!pickedSong || !pickedSong.id) {
			this.setError("Invalid song data!");
			return;
		}
		
		this.context.setHomeSuggestionPicked(pickedSong.name);
		this.fetchSuggestion(pickedSong.id);
	}
	
	refetchSuggestion = async () => {
		await this.context.loadSavedTracks();
		const { savedTracks } = this.context;
		this.pickRandomSongAndFetch(savedTracks);
	}
	
	setLoadingTrue = () => {
		this.setState({ loading: true });
	};
	
	setLoadingFalse = () => {
		this.setState({ loading: false });
	};
	
	setError = (message) => {
		this.setState({ error: true, loading: false, errorMessage: message });
	};
	
	setErrorFalse = () => {
		this.setState({ error: false });
	};
	
	fetchSuggestion = async (songId) => {
		if (this.abortController) this.abortController.abort();
		
		this.setLoadingTrue();
		this.abortController = new AbortController();
		const { signal } = this.abortController;
		
		try {
			const { endpoints } = this.context;
			const apiUrl = `${endpoints.songs}/${songId}/suggestions?limit=20`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(data.message || "No suggestions found");
			} else {
				this.context.setHomeSuggestionResults(data.data);
				this.setLoadingFalse();
				this.setErrorFalse();
			}
		} catch (error) {
			if (error.name === "AbortError") {
				console.log("Fetch request was aborted");
			} else {
				this.setError(error.message);
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
				
				quoteData ? e("article", { className: "max-w-lg mx-auto w-full bg-neutral-800 rounded-2xl p-5 space-y-3" },
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
				
				this.state.loading || this.state.error || this.context.homeSuggestion.results ?
				e("section", { className: "animate-fade-in w-full max-w-lg mx-auto flex flex-col justify-start items-center mt-6 gap-3" },
					e("div", { className: "w-full inline-flex justify-between items-center" },
						e("h2", { className: "w-full text-lg font-normal text-neutral-200 leading-snug" }, this.state.loading ? "Fetching suggestions…" : this.state.error ? 'Failed to load suggestions!' : `Since you liked ${this.context.homeSuggestion.picked}`),
						e(Button, { accent: "yellow", icon: "rotate-right", roundness: "full", clickHandler: this.refetchSuggestion, label: "Reload suggestions" }),
					),
					this.state.error ? (
						e(ErrorCard, { errorContext: this.state.errorMessage })
					) : this.state.loading ? (
						e(LoadingSongs, { list: "5" })
					) : (
						e("div", { className: "w-full flex flex-col justify-start items-center gap-2" },
							this.context.homeSuggestion.results.map((song) =>
								e(Song, {
									key: song.id,
									songId: song.id,
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