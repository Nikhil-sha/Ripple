import React, { Component, Fragment } from "react";
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';
import { renderLyrics } from '../components/utilities/all.js';

import Artist from '../components/artist.js';

class SongDetails extends Component {
	static contextType = AppContext;

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			errorMessage: null,
			lyricsState: {
				status: "idle",
				message: null
			},
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

	setLoadingFalse = () => {
		this.setState({ loading: false });
	};

	setError = (message) => {
		this.setState({ error: true, loading: false, errorMessage: message });
	};

	setErrorFalse = () => {
		this.setState({ error: false });
	};

	setLyricsState = (status, message = null) => {
		this.setState({
			lyricsState: { status, message },
		});
	};

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
				const filtered = Array.isArray(data.data) ? data.data[0] : data.data;
				this.context.setSpecificSongDetails(filtered);
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

	loadLyrics = () => {
		const { id } = this.context.specificSongDetails;
		if (!this.context.specificSongLyrics || this.context.specificSongLyrics.id !== id) {
			this.fetchLyrics(id);
		} else {
			this.setLyricsState("idle");
		}
	};

	fetchLyrics = async (songId) => {
		this.setLyricsState("loading");
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const apiUrl = `https://saavn.dev/api/songs/${songId}/lyrics`;

			const response = await fetch(apiUrl, { signal });
			const data = await response.json();

			if (!data.success) {
				this.setLyricsState("error", "Lyrics not found!");
			} else {
				this.context.setSpecificSongLyrics(songId, data.data);
				this.setLyricsState("success");
			}
		} catch (error) {
			if (error.name === "AbortError") {
				this.setLyricsState("error", "Fetch request was aborted!");
			} else {
				this.setLyricsState("error", "API failure!");
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
		const { loading, error, errorMessage, lyricsState } = this.state;
		let { specificSongDetails, specificSongLyrics } = this.context;
		if (loading) {
			return (
				<div className="fade_in h-full w-full flex flex-col justify-center items-center">
					<div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-r-transparent animate-spin"></div>
					<h2 className="pt-4">Loading…</h2>
				</div>
			)
		}

		if (error) {
			return (
				<section className="fade_in h-full w-full flex flex-col justify-center items-center">
					<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
					<h2 className="pt-2 w-64 font-bold leading-none text-lg text-center">Failed to load the song!</h2>
					<p className="w-64 leading-1 text-sm text-center text-neutral-400">REASON: {errorMessage ? errorMessage : "Don't know what happened!"}</p>
				</section>
			)
		}

		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<figure className="w-full flex flex-col justify-center items-center">
					<img src={specificSongDetails.image[specificSongDetails.image.length - 1].url} alt={specificSongDetails.name} className="w-2/4 md:w-1/4 aspect-square rounded-lg" />
					<figcaption className="mt-4 text-center">
						<h2 className="text-2xl text-neutral-800 font-bold mb-1">{specificSongDetails.name}</h2>
						<p className="text-sm text-neutral-600 font-semibold">from <a href={specificSongDetails.album.url} className="hover:underline">{specificSongDetails.album.name}</a> by <Link to={`/artist/${specificSongDetails.artists.primary[0].id}`} className="hover:underline">{specificSongDetails.artists.primary[0].name}</Link></p>
						<span className="leading-none text-sm text-neutral-400">{specificSongDetails.type} - {specificSongDetails.language} - {specificSongDetails.year}</span>
						<br />
						<span className="leading-none text-sm text-neutral-400">{specificSongDetails.playCount} Plays</span>
					</figcaption>
				</figure>

				{/* Button Section with Responsiveness */}
				<div className="w-fit flex flex-row gap-4 items-center mt-3 mx-auto">
					<button onClick={this.saveThis} className="rounded-full bg-yellow-400 hover:bg-neutral-400 text-neutral-700 hover:text-yellow-400 w-12 h-12 flex justify-center items-center transition">
						<i className="pt-0.5 fas fa-bookmark text-lg"></i>
					</button>
					<button onClick={this.addToPlayList} className="rounded-full bg-neutral-200/50 hover:bg-pink-400 text-neutral-700 hover:text-neutral-100 w-12 h-12 flex justify-center items-center transition">
						<i className="pl-1 pt-0.5 fas fa-play text-lg"></i>
					</button>
				</div>

				{/* More Info Section */}
				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<h3 className="text-lg font-semibold text-neutral-600">More about {specificSongDetails.name}</h3>
					<div className="mt-3">
						<h4 className="text-base font-semibold mb-2">Lyrics</h4>
						{lyricsState.status === "loading" ? (
							<div className="fade_in w-fit mx-auto flex justify-center items-center">
								<div className="w-4 h-4 rounded-full border-2 border-yellow-400 border-r-transparent animate-spin"></div>
								<h5 className="ml-2 text-sm">Loading…</h5>
							</div>
						) : lyricsState.status === "error" ? (
							<p className="text-sm text-neutral-400">{lyricsState.message}</p>
						) : specificSongLyrics && specificSongLyrics.id === specificSongDetails.id ? (
						<div className="mb-8">
							<p className="text-sm text-neutral-600">
								{renderLyrics(specificSongLyrics.lyrics.lyrics)}
							</p>
							<p className="text-sm font-bold">{renderLyrics(specificSongLyrics.lyrics.copyright)}</p>
						</div>
						) : (
							<button onClick={this.loadLyrics} className="px-2 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 rounded-md text-neutral-600">Load lyrics</button>
						)}
						<h4 className="text-base font-semibold mt-4 mb-2">Artists</h4>
						<div className="w-full flex gap-4 mb-8 overflow-x-auto">
							{specificSongDetails.artists.all ? specificSongDetails.artists.all.map((artist, index) => (
								<Artist key={index} artistId={artist.id} name={artist.name} image={artist.image.length ? artist.image[artist.image.length - 1].url : ''} role={artist.role} />
							)) : ""}
						</div>
					</div>
				</div>
				
				<p className="text-center text-sm font-bold text-neutral-600">
					{specificSongDetails.label} - {specificSongDetails.copyright}
				</p>
			</section>
		);
	}
}

export default withRouter(SongDetails);