import React, { Component } from "react";

import Song from '../components/song.js';

class Search extends Component {
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
		if (this.props.state.results) {
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

		if (this.props.state.query === query) {
			return;
		}

		const { handleUpdate } = this.props;
		this.setLoadingTrue();

		// Initialize AbortController before the try block
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const response = await fetch(`https://saavn.dev/api/search/songs?query=${query}`, { signal });
			const data = await response.json();

			if (!data.success || !data.data.results.length) {
				this.setError("No results found.");
			} else {
				handleUpdate(query, data.data.results);
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
					<div className="relative w-full max-w-md">
						<input
							type="text"
							value={query}
							onChange={this.handleInputChange}
							placeholder="Search..."
							className="w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onClick={this.handleSearch}
							className="absolute px-4 py-1 top-1/2 right-1.5 transform -translate-y-1/2 rounded-full text-white hover:text-gray-200 bg-blue-400 hover:bg-blue-500"
						>
							<i className="fas fa-search mt-1"></i>
						</button>
					</div>
					{loading ? (
						<div className="w-full h-full max-w-md flex flex-col justify-center items-center">
							<div className="w-8 h-8 rounded-full border-4 border-blue-500 border-r-transparent animate-spin"></div>
							<h2 className="pt-4">Loading…</h2>
						</div>
					) : error ? (
						<div className="w-full h-full max-w-md flex flex-col justify-center items-center">
							<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
							<h2 className="pt-2 w-64 font-bold leading-none text-lg text-center">Failed to load the song!</h2>
							<p className="w-64 leading-1 text-sm text-center text-gray-400">REASON: {errorMessage || "Don't know what happened!"}</p>
						</div>
					) : this.props.state.results ? (
						<div className="w-full max-w-md flex flex-col justify-center items-center mt-2">
							{this.props.state.results.map((song, index) => (
								<Song key={index} songId={song.id} name={song.name} artist={song.artist} cover={song.image[0].url} />
							))}
						</div>
					) : (
						<div className="w-full h-full max-w-md flex flex-col justify-center items-center font-semibold text-gray-600">
							Search to get started!
						</div>
					)}
				</div>
			</section>
		);
	}
}

export default Search;