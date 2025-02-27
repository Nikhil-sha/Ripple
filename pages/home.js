import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';
import { Link } from 'react-router-dom';

import Song from '../components/song';

class Home extends Component {
	static contextType = AppContext;

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			errorMessage: null,
		};
		this.abortController = null;
	}

	async componentDidMount() {
		this.setLoadingTrue();
		const savedTracks = await this.context.loadSavedTracks();
		if (!savedTracks || savedTracks.length === 0 ||
			(this.context.homeSuggestion.results && this.context.homeSuggestion.results.length > 0)) {
			this.setLoadingFalse();
			this.setErrorFalse();
			return;
		}

		const randomPick = Math.floor(Math.random() * savedTracks.length);
		const pickedSong = savedTracks[randomPick];
		if (!pickedSong || !pickedSong.id) {
			this.setError("Invalid song data!");
			return;
		}

		this.context.setHomeSuggestionPicked(pickedSong.name);
		this.fetchSuggestion(pickedSong.id);
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
			const apiUrl = `https://jiosavan-api-tawny.vercel.app/api/songs/${songId}/suggestions?limit=15`;

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
			<Fragment>
				<div className="max-w-lg mx-auto w-full flex flex-row gap-4 justify-start items-center mb-4 overflow-x-auto">
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded-lg">
						<Link to="/about" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-user fa-md text-white"></i>
							<span className="text-sm font-bold text-white">About</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-lg">
						<Link to="/search" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-search fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Search</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg">
						<Link to="/saved" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bookmark fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Saved</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-lg">
						<Link to="/notifications" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bell fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Notifications</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-sky-600 to-sky-400 rounded-lg">
						<Link to="/settings" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-cogs fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Settings</span>
						</Link>
					</div>
				</div>

				<article className="max-w-sm mx-auto w-full p-2 px-4 bg-yellow-200 border-l-4 border-yellow-400 rounded-md mb-4">
					<p className="text-xs text-neutral-600">{quoteData.quote}</p>
					<a className="underline text-neutral-600 hover:text-sky-400" href={`https://www.google.com/search?q=${encodeURIComponent(quoteData.quote + ' by "' + quoteData.author + '"')}`} aria-label={`Search for quote: "${quoteData.quote}" by ${quoteData.author}`}>
						<i className="block text-xs text-right font-bold"> - {quoteData.author}</i>
					</a>
				</article>
				
				{this.state.loading ? (
					<div className="w-full max-w-md mx-auto flex flex-col justify-center items-center mt-6">
						<div className="w-8 h-8 rounded-full border-4 border-yellow-500 border-r-transparent animate-spin"></div>
						<h2 className="pt-4 text-lg font-semibold text-neutral-200">Loading…</h2>
					</div>
				) : this.state.error ? (
					<div className="w-full max-w-md mx-auto flex flex-col justify-center items-center mt-6">
						<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
						<h2 className="pt-2 font-bold text-lg text-center text-neutral-100">Failed to load the song!</h2>
						<p className="text-sm text-center text-neutral-300">REASON: {this.state.errorMessage || "An unknown error occurred!"}</p>
					</div>
				) : this.context.homeSuggestion.results ? (
					<div className="w-full max-w-md mx-auto flex flex-col justify-start items-center mt-6 space-y-2">
						<h2 className="w-full text-lg font-medium text-neutral-200 leading-snug mb-2">Since you liked {this.context.homeSuggestion.picked}</h2>
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
					</div>
				) : (
					<div className="w-full max-w-md flex flex-col justify-center items-center mt-4 font-semibold text-md text-center text-neutral-200">
						"Find and play your favorite songs while we work on some awesome new surprises for you!"
					</div>
				)}
			</Fragment>
		);
	}
}

export default Home;