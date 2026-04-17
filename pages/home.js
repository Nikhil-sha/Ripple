import React, { Component } from 'react';
import { AppContext } from '../context';
import { Link } from 'react-router-dom';

import Song from '../components/song';
import Button from '../components/button';
import { renderText } from '../utilities/all';
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
			<section className="animate-fade-in-up min-h-0 w-full px-3 md:px-0 pt-4">
				<div className="max-w-lg w-full mx-auto flex justify-between gap-4 mb-6">
				{
					[
						{ icon: 'user', label: 'About', path: '/about', color: 'from-cyan-600 to-cyan-500' },
						{ icon: 'search', label: 'Search', path: '/search', color: 'from-yellow-600 to-yellow-500' },
						{ icon: 'heart', label: 'Saved', path: '/saved', color: 'from-blue-600 to-blue-500' },
						{ icon: 'gear', label: 'Settings', path: '/settings', color: 'from-rose-600 to-rose-500' },
						{ icon: 'download', label: 'Downloads', path: '/downloads', color: 'from-emerald-600 to-emerald-500' }
					].map(({ icon, label, path, color }) => (
						<div key={label} className={`flex-grow h-12 bg-gradient-to-tr ${color} rounded-2xl shadow-md`}>
							<Link to={path} className="size-full flex flex-col justify-center items-center">
								<i className={`fa-solid fa-${icon} text-lg leading-tight text-neutral-800`}></i>
							</Link>
						</div>
					))
				}
				</div>

				{quoteData ? <article className="max-w-lg mx-auto w-full bg-gradient-to-br from-neutral-700 to-50% to-neutral-800 rounded-xl p-5 space-y-3">
					<div className="flex items-start space-x-2">
						<p className="leading-snug text-neutral-200 text-sm"><i className="mr-1 text-yellow-400">“</i><span>{quoteData.quote}</span><i className="ml-1 text-yellow-400">”</i></p>
					</div>
					<span className="ml-auto block w-fit text-sm text-neutral-400">
						{quoteData.author}
					</span>
				</article> : null}

				{this.state.loading || this.state.error || this.context.homeSuggestion.results ? (
					<section className="animate-fade-in w-full max-w-lg mx-auto flex flex-col justify-start items-center mt-6 gap-3">
						<div className="w-full inline-flex justify-between items-center">
							<h2 className="w-full text-lg font-normal text-neutral-200 leading-snug">{this.state.loading ? "Fetching suggestions…" : this.state.error ? 'Failed to load suggestions!' : `Since you liked ${this.context.homeSuggestion.picked}`}</h2>
							<Button accent="yellow" icon="rotate-right" roundness="full" clickHandler={this.refetchSuggestion} label="Reload suggestions" />
						</div>
						{this.state.error ? (
							<ErrorCard errorContext={this.state.errorMessage} />
						) : this.state.loading ? (
							<LoadingSongs list="5" />
						) : (
							<div className="w-full flex flex-col justify-start items-center gap-2">
							{this.context.homeSuggestion.results.map((song) => (
								<Song 
									key={song.id} 
									songId={song.id} 
									name={renderText(song.name)} 
									artist={renderText(song.artists.primary[0].name)} 
									album={renderText(song.album.name)} 
									year={song.year} 
									coverSm={song.image[1].url} 
									coverBg={song.image[song.image.length - 1].url} 
									sources={song.downloadUrl} 
									option="save" 
								/>
							))}
							</div>
						)}
					</section>
				) : null}
			</section>
		);
	}
}

export default Home;