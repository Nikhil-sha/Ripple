import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';
import { Link } from 'react-router-dom';

import Song from '../components/song';

class Home extends Component {
	static contextType = AppContext;

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

	componentWillUnmount() {
		if (this.abortController) {
			this.abortController.abort();
		}
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
		this.setLoadingTrue();
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const { endpoints } = this.context;
			const apiUrl = `${endpoints[1].songs}/${songId}/suggestions?limit=20`;

			const response = await fetch(apiUrl, { signal });
			const data = await response.json();

			if (!data.success) {
				this.setError("No suggestions found");
			} else {
				this.context.setHomeSuggestionResults(data.data);
				this.setLoadingFalse();
				this.setErrorFalse();
			}
		} catch (error) {
			if (error.name === "AbortError") {
				console.log("Fetch request was aborted");
			} else {
				this.setError("API failure");
			}
		}
	};

	render() {
		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<div className="max-w-lg mx-auto w-full flex flex-row gap-4 justify-start items-center mb-4 overflow-x-auto">
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-cyan-500 to-cyan-300 rounded-lg">
						<Link to="/about" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-user fa-md text-white"></i>
							<span className="text-sm font-bold text-white">About</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-yellow-500 to-yellow-300 rounded-lg">
						<Link to="/search" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-search fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Search</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-lg">
						<Link to="/saved" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bookmark fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Saved</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-rose-500 to-rose-300 rounded-lg">
						<Link to="/notifications" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bell fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Notifications</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-sky-500 to-sky-300 rounded-lg">
						<Link to="/settings" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-cogs fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Settings</span>
						</Link>
					</div>
				</div>

				<article className="max-w-sm mx-auto w-full p-2 px-4 bg-yellow-200 border-l-4 border-yellow-400 rounded-md mb-4">
					<p className="text-xs text-yellow-600">{quoteData.quote}</p>
					<a className="underline text-yellow-600 hover:text-sky-400" href={`https://www.google.com/search?q=${encodeURIComponent(quoteData.quote + ' by "' + quoteData.author + '"')}`} aria-label={`Search for quote: "${quoteData.quote}" by ${quoteData.author}`}>
						<i className="block text-xs text-right font-bold"> - {quoteData.author}</i>
					</a>
				</article>
				
				{this.state.loading ? (
					<div className="fade_in w-full max-w-md mx-auto flex flex-col justify-center items-center mt-6">
						<div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-r-transparent animate-spin"></div>
						<h2 className="pt-4 text-lg font-semibold text-neutral-800">Loading…</h2>
					</div>
				) : this.state.error ? (
					<section className="fade_in w-full max-w-md mx-auto flex flex-col justify-center items-center mt-6">
						<i className="fas fa-exclamation-circle text-2xl text-red-400"></i>
						<h2 className="pt-2 font-bold text-lg text-center text-neutral-800">Failed to load the song!</h2>
						<p className="text-sm text-center text-neutral-600">REASON: {this.state.errorMessage || "An unknown error occurred!"}</p>
					</section>
				) : this.context.homeSuggestion.results ? (
					<section className="fade_in_up w-full max-w-md mx-auto flex flex-col justify-start items-center mt-6 space-y-2">
						<div className="w-full inline-flex justify-between items-center mb-2">
							<h2 className="w-full text-lg font-medium text-neutral-800 leading-snug">Since you liked {this.context.homeSuggestion.picked}</h2>
							<button className="flex-shrink-0 group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.refetchSuggestion} aria-label="Reload suggestions">
								<i className="fas fa-rotate-right text-neutral-700 group-hover:text-neutral-100"></i>
							</button>
						</div>
						{this.context.homeSuggestion.results.map((song) => (
							<Song 
								key={song.id} 
								songId={song.id} 
								name={song.name} 
								artist={song.artists.primary[0].name} 
								coverSm={song.image[0].url} 
								coverBg={song.image[song.image.length - 1].url} 
								sources={song.downloadUrl} 
								option="save" 
							/>
						))}
					</section>
				) : (
					<div className="fade_in_up w-full max-w-md flex flex-col justify-center items-center mt-4 font-semibold text-base text-center text-neutral-700">
						Find and play your favorite songs while we work on some awesome new surprises for you!
					</div>
				)}
			</section>
		);
	}
}

export default Home;