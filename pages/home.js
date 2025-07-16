import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';
import { Link } from 'react-router-dom';

import Song from '../components/song';
import { checkResponseCode } from '../components/utilities/all';
import ErrorCard from '../components/error';
import LoadingSongs from '../components/loadings/loadingSongs';

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
			const apiUrl = `${endpoints[0].songs}/${songId}/suggestions?limit=20`;

			const response = await fetch(apiUrl, { signal });
			checkResponseCode(response);
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
				this.setError(error.message);
			}
		}
	};

	render() {
		return (
			<section className="animate-fade-in-up min-h-0 w-full px-4 md:px-8 lg:px-12 pt-4">
				<div className="max-w-lg w-full mx-auto flex gap-4 justify-start items-center mb-6 overflow-x-auto scroll-smooth">
				{
					[
						{ icon: 'user', label: 'About', path: '/about', color: 'from-cyan-500 to-cyan-300' },
						{ icon: 'search', label: 'Search', path: '/search', color: 'from-yellow-500 to-yellow-300' },
						{ icon: 'heart', label: 'Saved', path: '/saved', color: 'from-blue-500 to-blue-300' },
						{ icon: 'cogs', label: 'Settings', path: '/settings', color: 'from-rose-500 to-rose-300' }
					].map(({ icon, label, path, color }) => (
						<div key={label} className={`flex-shrink-0 w-28 h-28 rounded-md bg-gradient-to-tr ${color}`}>
							<Link to={path} className="w-full h-full flex flex-col justify-end items-start px-3 py-2">
								<i className={`fa-solid fa-${icon} text-lg leading-tight text-white`}></i>
								<span className="text-sm font-medium leading-tight text-white">{label}</span>
							</Link>
						</div>
					))
				}
				</div>


				{quoteData && <article className="max-w-md mx-auto w-full bg-yellow-50 rounded-md p-5 space-y-3">
					<div className="flex items-start space-x-2">
						<p className="leading-snug text-neutral-800 text-sm"><i className="mr-1 text-yellow-400">“</i><span>{quoteData.quote}</span><i className="ml-1 text-yellow-400">”</i></p>
					</div>
					<a href={`https://www.google.com/search?q=${encodeURIComponent(quoteData.quote + ' by "' + quoteData.author + '"')}`} className="ml-auto block w-fit text-sm text-neutral-600 hover:underline" aria-label={`Search for quote: "${quoteData.quote}" by ${quoteData.author}`}>
						— {quoteData.author}
					</a>
				</article>}

				{this.state.loading ? (
					<LoadingSongs list="5">
						<h2 className="w-full text-lg font-normal text-neutral-800 leading-snug my-4">Getting suggestions…</h2>
					</LoadingSongs>
				) : this.state.error ? (
					<ErrorCard errorContext={this.state.errorMessage} />
				) : this.context.homeSuggestion.results ? (
					<section className="animate-fade-in w-full max-w-md mx-auto flex flex-col justify-start items-center mt-6 space-y-2">
						<div className="w-full inline-flex justify-between items-center mb-2">
							<h2 className="w-full text-lg font-normal text-neutral-800 leading-snug">Since you liked {this.context.homeSuggestion.picked}</h2>
							<button className="flex-shrink-0 group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.refetchSuggestion} aria-label="Reload suggestions">
								<i className="fas fa-rotate-right text-neutral-700 group-hover:text-neutral-100 group-hover:rotate-180 transition-transform duration-500"></i>
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
					""
				)}
			</section>
		);
	}
}

export default Home;