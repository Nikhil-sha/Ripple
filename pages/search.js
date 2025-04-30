import React, { Component, Fragment } from "react";
import { withRouter } from 'react-router-dom';
import { AppContext } from '../context';

import Song from '../components/song.js';
import ErrorCard from '../components/error';
import { checkResponseCode } from '../components/utilities/all';
import LoadingSongs from '../components/loadings/loadingSongs';

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

		const { endpoints, updateSearchState } = this.context;
		this.setLoadingTrue();

		// Initialize AbortController before the try block
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const response = await fetch(`${endpoints[1].search}?query=${query.trim()}&limit=${parseInt(this.context.searchResultsLimit || "10")}`, { signal });
			checkResponseCode(response);
			const data = await response.json();

			if (!data.success || !data.data.results.length) {
				this.setError("No results found.");
			} else {
				updateSearchState(query, data.data.results);
				this.setLoadingFalse();
				this.setErrorFalse();
			}
		} catch (e) {
			this.setError(e.message);
		}
	};

	handleSearch = () => {
		this.fetchResult(this.state.query);
	};

	render() {
		const { loading, error, errorMessage, query } = this.state;

		return (
			<section className="animate-fade-in-up min-h-0 w-full px-4 md:px-8 lg:px-12 pt-4">
				<div className="min-h-full flex flex-col justify-start items-center">
					<div className="flex gap-2 w-full max-w-md">
						<input
							type="text"
							value={query}
							onChange={this.handleInputChange}
							placeholder="Search for songs..."
							className="grow px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-neutral-600 transition"
						/>
						<button
							onClick={this.handleSearch}
							className="flex-shrink-0 bg-yellow-300 hover:bg-yellow-400 text-neutral-700 font-semibold px-6 py-3 rounded-xl transition"
						>
							<i className="fa-solid fa-search mt-1"></i>
						</button>
					</div>

					{loading ? (
						<LoadingSongs list="8">
							<h2 className="w-full text-lg font-normal text-neutral-800 leading-snug">Hold On…</h2>
						</LoadingSongs>
					) : error ? (
						<ErrorCard errorContext={this.state.errorMessage} />
					) : this.context.search.results ? (
						<section className="animate-fade-in w-full max-w-md flex flex-col justify-start items-center mt-4 space-y-2">
							<h2 className="w-full text-lg font-normal text-neutral-800 leading-snug">Results for {this.context.search.query}</h2>
							{this.context.search.results.map((song, index) => (
								<Song 
									key={index} 
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
						<p className="animate-fade-in w-full max-w-md flex flex-col justify-center items-center mt-4 font-normal text-neutral-600">
							What's on your mind today?
						</p>
					)}
				</div>
			</section>
		);
	}
}

export default withRouter(Search);
