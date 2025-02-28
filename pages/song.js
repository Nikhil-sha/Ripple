import React, { Component, Fragment } from "react";
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

import Artist from '../components/artist.js';

class SongDetails extends Component {
	static contextType = AppContext;

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			errorMessage: null,
			lyricsState: "collapsed"
		};
		this.abortController = null;
	}

	componentDidMount() {
		const { songId } = this.props.match.params;
		if (!this.context.specificSongDetails || this.context.specificSongDetails.id !== songId) {
			this.fetchSong(songId);
		} else {
			this.setLoadingFalse();
			this.setErrorFalse();
		}
	}

	componentDidUpdate(prevProps) {
		const currentSongId = this.props.match.params.songId;
		const previousSongId = prevProps.match.params.songId;

		if (currentSongId !== previousSongId) {
			this.fetchSong(currentSongId);
		}
	}

	componentWillUnmount() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	setLoadingTrue = () => {
		this.setState({ loading: true });
	};

	setSong = (data) => {
		this.context.setSpecificSongDetails(data);
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

	toggleLyricsState = () => {
		let stateToSet = this.state.lyricsState === "collapsed" ? "expanded" : "collapsed";
		this.setState({
			lyricsState: stateToSet,
		});
	};

	renderHtml = (html) =>
		html.split(/<br\s*\/?>/gi).map((part, i) => (
			<React.Fragment key={i}>
				{part}
				{i < html.split(/<br\s*\/?>/gi).length - 1 && <br />}
			</React.Fragment>
		));

	fetchSong = async (songId) => {
		this.setLoadingTrue();
		const decodedSongId = decodeURIComponent(songId);
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const isUrl = decodedSongId.startsWith("https://www.jiosaavn.com/") || decodedSongId.startsWith("https://");
			const apiUrl = isUrl ?
				`https://saavn.dev/api/songs?link=${encodeURIComponent(decodedSongId)}` :
				`https://saavn.dev/api/songs/${decodedSongId}`;

			const response = await fetch(apiUrl, { signal });
			const data = await response.json();

			if (!data.success) {
				this.setError("No song found");
			} else {
				this.setSong(Array.isArray(data.data) ? data.data[0] : data.data);
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

	addToPlayList = () => {
		const { specificSongDetails } = this.context;
		const track = {
			id: specificSongDetails.id,
			name: specificSongDetails.name,
			artist: specificSongDetails.artists.primary[0].name,
			sources: specificSongDetails.downloadUrl,
			coverSm: specificSongDetails.image[0].url,
			coverBg: specificSongDetails.image[specificSongDetails.image.length - 1].url,
		};
		this.context.updatePlayList([track, ...this.context.playList]);
		setTimeout(() => this.context.playerMethods.setTrack(0), 100);
	};

	saveThis = () => {
		const { specificSongDetails } = this.context;
		const track = {
			id: specificSongDetails.id,
			name: specificSongDetails.name,
			artist: specificSongDetails.artists.primary[0].name,
			sources: specificSongDetails.downloadUrl,
			coverSm: specificSongDetails.image[0].url,
			coverBg: specificSongDetails.image[specificSongDetails.image.length - 1].url,
		};
		this.context.updateLocalStorage(track);
	};

	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificSongDetails } = this.context;
		if (loading) {
			return (
				<div className="h-full w-full flex flex-col justify-center items-center">
					<div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-r-transparent animate-spin"></div>
					<h2 className="pt-4">Loading…</h2>
				</div>
			)
		}

		if (error) {
			return (
				<div className="h-full w-full flex flex-col justify-center items-center">
					<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
					<h2 className="pt-2 w-64 font-bold leading-none text-lg text-center">Failed to load the song!</h2>
					<p className="w-64 leading-1 text-sm text-center text-neutral-400">REASON: {errorMessage ? errorMessage : "Don't know what happened!"}</p>
				</div>
			)
		}

		return (
			<Fragment>
				<figure className="w-full flex flex-col justify-center items-center">
					<img src={specificSongDetails.image[specificSongDetails.image.length - 1].url} alt={specificSongDetails.name} className="w-2/4 md:w-1/4 aspect-square rounded-lg" />
					<figcaption className="mt-4 text-center">
						<h2 className="text-2xl text-neutral-100 font-bold mb-1">{specificSongDetails.name}</h2>
						<p className="text-sm text-neutral-300 font-semibold">from <a href={specificSongDetails.album.url} className="hover:underline">{specificSongDetails.album.name}</a> by <Link to={`/artist/${specificSongDetails.artists.primary[0].id}`} className="hover:underline">{specificSongDetails.artists.primary[0].name}</Link></p>
						<span className="leading-none text-sm text-neutral-500">{specificSongDetails.type} - {specificSongDetails.language} - {specificSongDetails.year}</span>
						<br />
						<span className="leading-none text-sm text-neutral-500">{specificSongDetails.playCount} Plays</span>
					</figcaption>
				</figure>

				{/* Button Section with Responsiveness */}
				<div className="w-fit flex flex-row gap-4 items-center mt-3 mx-auto">
					<button onClick={this.saveThis} className="rounded-full bg-yellow-400 hover:bg-yellow-600 text-neutral-600 hover:text-yellow-400 w-12 h-12 flex justify-center items-center transition">
						<i className="pt-0.5 fas fa-bookmark text-lg"></i>
					</button>
					<button onClick={this.addToPlayList} className="rounded-full bg-neutral-600 hover:bg-neutral-900 text-neutral-200 hover:text-yellow-400 w-12 h-12 flex justify-center items-center transition">
						<i className="pl-1 pt-0.5 fas fa-play text-lg"></i>
					</button>
				</div>

				{/* More Info Section */}
				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<h3 className="text-lg font-semibold text-neutral-200">More about {specificSongDetails.name}</h3>
					<div className="mt-3">
						<h4 onClick={this.toggleLyricsState} className="text-base font-semibold flex justify-between mb-2"><span>Lyrics</span><i className="fas fa-chevron-down fa-sm pt-3"></i></h4>
						{specificSongDetails.lyrics ? (
						<div className="mb-8">
							<p className="text-sm text-neutral-200">
								{this.state.lyricsState === "collapsed" ? (specificSongDetails.lyrics.snippet + "…") : (this.renderHtml(specificSongDetails.lyrics.lyrics))}
							</p>
							<p className="text-sm font-bold">{this.renderHtml(specificSongDetails.lyrics.copyright)}</p>
						</div>
						) : (
							<p className="text-sm text-neutral-400">No lyrics available!</p>
						)}
						<h4 className="text-base font-semibold mt-4 mb-2">Artists</h4>
						<div className="w-full flex gap-4 mb-8 overflow-x-auto">
							{specificSongDetails.artists.all ? specificSongDetails.artists.all.map((artist, index) => (
								<Artist key={index} artistId={artist.id} name={artist.name} image={artist.image.length ? artist.image[artist.image.length - 1].url : ''} role={artist.role} />
							)) : ""}
						</div>
					</div>
				</div>
				
				<p className="text-center text-base font-bold text-neutral-300">
					{specificSongDetails.label} - {specificSongDetails.copyright}
				</p>
			</Fragment>
		);
	}
}

export default withRouter(SongDetails);