import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { AppContext } from '../context';

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
				this.setSong(data.data[0]);
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
			src: specificSongDetails.downloadUrl[specificSongDetails.downloadUrl.length - 1].url,
			coverSm: specificSongDetails.image[0].url,
			coverBg: specificSongDetails.image[specificSongDetails.image.length - 1].url,
		};
		this.context.updatePlayList([track, ...this.context.playList]);
	};

	saveThis = () => {
		const { specificSongDetails } = this.context;
		const track = {
			id: specificSongDetails.id,
			name: specificSongDetails.name,
			artist: specificSongDetails.artists.primary[0].name,
			src: specificSongDetails.downloadUrl[specificSongDetails.downloadUrl.length - 1].url,
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
				<div className="h-full w-full pb-20 flex flex-col justify-center items-center">
					<div className="w-8 h-8 rounded-full border-4 border-blue-500 border-r-transparent animate-spin"></div>
					<h2 className="pt-4">Loading…</h2>
				</div>
			)
		}

		if (error) {
			return (
				<div className="h-full w-full pb-20 flex flex-col justify-center items-center">
					<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
					<h2 className="pt-2 w-64 font-bold leading-none text-lg text-center">Failed to load the song!</h2>
					<p className="w-64 leading-1 text-sm text-center text-gray-400">REASON: {errorMessage ? errorMessage : "Don't know what happened!"}</p>
				</div>
			)
		}

		return (
			<section className="w-full h-full overflow-y-auto px-4 md:px-10 pt-10 pb-20">
				<figure className="w-full flex flex-col justify-center items-center">
					<img src={specificSongDetails.image[specificSongDetails.image.length - 1].url} alt={specificSongDetails.name} className="w-2/4 md:w-1/4 aspect-square rounded-lg shadow-lg" />
					<figcaption className="mt-4 text-center">
						<h2 className="text-2xl font-bold mb-1">{specificSongDetails.name}</h2>
						<p className="text-sm text-gray-500 font-semibold">from <a href={specificSongDetails.album.url} className="hover:underline">{specificSongDetails.album.name}</a> by <a href={specificSongDetails.artists.primary[0].url} className="hover:underline">{specificSongDetails.artists.primary[0].name}</a></p>
						<span className="leading-none text-sm font-semibold text-gray-500">{specificSongDetails.type} - {specificSongDetails.year}</span>
						<br />
						<span className="leading-none text-sm font-semibold text-gray-500">{specificSongDetails.playCount} Plays</span>
					</figcaption>
				</figure>

				{/* Button Section with Responsiveness */}
				<div className="w-fit flex flex-row gap-4 items-center mt-3 mx-auto">
					<button onClick={this.saveThis} className="rounded-full border-b-2 border-r-2 border-yellow-500 hover:border-none bg-yellow-400 hover:bg-yellow-500 text-white w-12 h-12 flex justify-center items-center shadow-md">
						<i className="pt-0.5 fas fa-bookmark text-lg"></i>
					</button>
					<button onClick={this.addToPlayList} className="rounded-full border-b-2 border-r-2 border-gray-400 hover:border-none bg-gray-200 hover:bg-gray-300 text-gray-800 w-12 h-12 flex justify-center items-center shadow-md">
						<i className="pl-1 pt-0.5 fas fa-play text-lg"></i>
					</button>
				</div>

				{/* More Info Section */}
				<div className="w-full mt-8 mb-4">
					<h3 className="text-lg font-semibold text-gray-400">More about {specificSongDetails.name}</h3>
					<div className="mt-3">
						<h4 onClick={this.toggleLyricsState} className="text-md font-semibold flex justify-between mb-2"><span>Lyrics</span><i className="fas fa-chevron-down fa-sm pt-3"></i></h4>
						{specificSongDetails.lyrics ? (
						<div>
							<p className="text-sm text-gray-600">
								{this.state.lyricsState === "collapsed" ? (specificSongDetails.lyrics.snippet + "…") : (this.renderHtml(specificSongDetails.lyrics.lyrics))}
							</p>
							<p className="text-sm font-bold">{this.renderHtml(specificSongDetails.lyrics.copyright)}</p>
						</div>
						) : (
							<p>No lyrics available!</p>
						)}
						<h4 className="text-md font-semibold mt-4 mb-2">Artists</h4>
						<div className="w-full flex gap-4 overflow-x-auto">
							{specificSongDetails.artists.all ? specificSongDetails.artists.all.map((artist, index) => (
								<div key={index} className="relative w-20 flex-shrink-0 h-20 aspect-square rounded-full overflow-hidden">
									<a href={artist.url}>
										<img src={artist.image.length ? artist.image[artist.image.length - 1].url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUOdfo4lewXJYT_2xPo_Xu2Lj6xqdd64xHk1-mWhbM6Fw&s'} alt={artist.name} className="w-full object-cover" />
										<div className="absolute flex flex-col justify-center items-center top-0 p-2 min-w-0 w-full h-full bg-black/25">
											<p className="block min-w-0 w-full text-center text-xs text-gray-200 font-bold truncate">{artist.name}</p>
											<span className="block min-w-0 w-full text-center text-xs text-gray-200 font-thin truncate">{artist.role}</span>
										</div>
									</a>
								</div>
							)) : null}
						</div>
					</div>
				</div>
				
				<p className="text-center text-md font-bold text-gray-800">
					{specificSongDetails.label} - {specificSongDetails.copyright}
				</p>
			</section>
		);
	}
}

export default withRouter(SongDetails);