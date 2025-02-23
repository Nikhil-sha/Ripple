import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { AppContext } from '../context';
import Song from '../components/song.js';

class Search extends Component {
	static contextType = AppContext;

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			errorMessage: null,
			query: "",
		};
		this.abortController = null;
	}

	componentDidMount() {
		if (this.context.search.results) {
			this.setLoadingFalse();
			this.setErrorFalse();
		}
	}

	componentWillUnmount() {
		// Cancel ongoing fetch request when the component unmounts
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

	handleInputChange = (e) => {
		this.setState({ query: e.target.value });
	};

	fetchResult = async (query) => {
		if (!query.trim()) {
			return;
		}

		const isUrl = query.startsWith("https://www.jiosaavn.com/") || query.startsWith("https://");
		if (isUrl) {
			const url = encodeURIComponent(query);
			this.props.history.push(`/song/${url}`);
			return;
		}

		if (this.context.search.query === query) {
			return;
		}

		const { updateSearchState } = this.context;
		this.setLoadingTrue();

		// Initialize AbortController before the try block
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const response = await fetch(`https://https://jiosavan-api-tawny.vercel.app/api/search/songs?query=${query.trim()}&limit=${parseInt(this.context.searchResultsLimit || "10")}`, { signal });
			const data = await response.json();

			if (!data.success || !data.data.results.length) {
				this.setError("No results found.");
			} else {
				updateSearchState(query, data.data.results);
				this.setLoadingFalse();
				this.setErrorFalse();
			}
		} catch (e) {
			this.setError("API failure. Please try again.");
		}
	};

	handleSearch = () => {
		this.fetchResult(this.state.query);
	};

	render() {
		const { loading, error, errorMessage, query } = this.state;

		return (
			<section className="w-full h-full overflow-y-auto px-4 md:px-10 pb-20">
				<div className="min-h-full flex flex-col justify-start items-center py-5">
					<div className="flex gap-2 w-full max-w-md">
						<input
							type="text"
							value={query}
							onChange={this.handleInputChange}
							placeholder="Search for songs..."
							className="grow px-4 py-2 text-md text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400 transition"
						/>
						<button
							onClick={this.handleSearch}
							className="flex-shrink-0 border border-white px-4 py-2 rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:border-yellow-400 transition"
						>
							<i className="fas fa-search mt-1"></i>
						</button>
					</div>

					{loading ? (
						<div className="w-full max-w-md flex flex-col justify-center items-center mt-4">
							<div className="w-8 h-8 rounded-full border-4 border-blue-500 border-r-transparent animate-spin"></div>
							<h2 className="pt-4 text-lg font-semibold text-gray-600">Loading…</h2>
						</div>
					) : error ? (
						<div className="w-full max-w-md flex flex-col justify-center items-center mt-4">
							<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
							<h2 className="pt-2 font-bold text-lg text-center text-gray-800">Failed to load the song!</h2>
							<p className="text-sm text-center text-gray-400">REASON: {errorMessage || "An unknown error occurred!"}</p>
						</div>
					) : this.context.search.results ? (
						<div className="w-full max-w-md flex flex-col justify-start items-center mt-4 space-y-2">
							<h2 className="w-full text-lg font-medium text-gray-800 leading-snug">Results</h2>
							{this.context.search.results.map((song) => (
								<Song 
									key={song.id} 
									songId={song.id} 
									name={song.name} 
									artist={song.artists.all[0].name} 
									coverSm={song.image[0].url} 
									coverBg={song.image[song.image.length - 1].url} 
									sources={song.downloadUrl} 
									option="save" 
								/>
							))}
						</div>
					) : (
						<div className="w-full max-w-md flex flex-col justify-center items-center mt-4 font-semibold text-gray-600">
							Search to get started!
						</div>
					)}
				</div>
			</section>
		);
	}
}

export default withRouter(Search);
