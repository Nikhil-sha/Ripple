import React, { Component } from "react";
import { withRouter } from 'react-router-dom';

class SongDetails extends Component {
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
		if (!this.props.song || this.props.song.id !== songId) {
			this.fetchSong(songId);
		} else {
			this.setLoadingFalse();
			this.setErrorFalse();
		}
	}

	componentDidUpdate(prevProps) {
		const currentSongId = this.props.match.params.songId;
		const previousSongId = prevProps.match.params.songId;

		// Check if the song ID has changed
		if (currentSongId !== previousSongId) {
			this.fetchSong(currentSongId);
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

	setSong = (data) => {
		this.props.handleUpdate(data);
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

		// Initialize AbortController
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		try {
			const response = await fetch(`https://saavn.dev/api/songs/${songId}`, { signal });
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
		const { song } = this.props;
		const track = {
			id: song.id,
			name: song.name,
			artist: song.artists.primary[0].name,
			src: song.downloadUrl[song.downloadUrl.length - 1].url,
			thumbnailMin: song.image[0].url,
			thumbnailMax: song.image[song.image.length - 1].url,
		};
		this.props.updatePlayList([track, ...this.props.playList]);
	};

	render() {
		const { loading, error, errorMessage } = this.state;
		let { song } = this.props;
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
					<img src={song.image[song.image.length - 1].url} alt={song.name} className="w-2/4 md:w-1/4 aspect-square rounded-lg shadow-lg" />
					<figcaption className="mt-4 text-center">
						<h2 className="text-2xl font-bold mb-1">{song.name}</h2>
						<p className="text-sm text-gray-500 font-semibold">from <a href={song.album.url} className="hover:underline">{song.album.name}</a> by <a href={song.artists.primary[0].url} className="hover:underline">{song.artists.primary[0].name}</a></p>
						<span className="leading-none text-sm font-semibold text-gray-500">{song.type} - {song.year}</span>
						<br />
						<span className="leading-none text-sm font-semibold text-gray-500">{song.playCount} Plays</span>
					</figcaption>
				</figure>
				<div className="w-fit flex flex-row gap-4 items-center mt-3 mx-auto">
					<button onClick={() => alert("feature coming soon!")} className="rounded-full bg-yellow-400 hover:bg-yellow-500 text-white w-12 h-12 flex justify-center items-center shadow-md">
						<i className="pt-0.5 fas fa-bookmark text-lg"></i>
					</button>
					<button onClick={this.addToPlayList} className="rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 w-12 h-12 flex justify-center items-center shadow-md">
						<i className="pt-0.5 fas fa-play text-lg"></i>
					</button>
				</div>
				<div className="w-full mt-8">
					<h3 className="text-lg font-semibold text-gray-400">More about {song.name}</h3>
					<div className="mt-3">
						<h4 onClick={this.toggleLyricsState} className="text-md font-semibold flex justify-between mb-2"><span>Lyrics</span><i className="fas fa-chevron-down fa-sm ml-2"></i></h4>
						{song.lyrics ? (
						<div>
							<p className="text-sm text-gray-600">
								{this.state.lyricsState === "collapsed" ? (song.lyrics.snippet + "…") : (this.renderHtml(song.lyrics.lyrics))}
							</p>
							<p className="text-sm font-bold">{this.renderHtml(song.lyrics.copyright)}</p>
						</div>
						) : (
							<p>No lyrics available!</p>
						)}
						<h4 className="text-md font-semibold mt-4 mb-2">Artists</h4>
						<div className="w-full flex gap-4 overflow-x-auto">
							{song.artists.all ? song.artists.all.map((artist, index) => (
								<div key={index} className="w-20 flex-shrink-0">
									<a href={artist.url}>
										<img src={artist.image.length ? artist.image[artist.image.length - 1].url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUOdfo4lewXJYT_2xPo_Xu2Lj6XPn78X9UJA&s'} alt={artist.name} className="w-full aspect-square rounded-full shadow-lg mb-1" />
										<div className="text-center">
											<h5 className="text-sm font-bold">{artist.name}</h5>
											<p className="text-xs">{artist.role}</p>
										</div>
									</a>
								</div>
							)) : ''}
						</div>
					</div>
				</div>
				<div className="text-center mt-4">
					<p className="text-sm text-gray-600 font-semibold">{song.label} - {song.copyright}</p>
				</div>
			</section>
		)
	}
}

export default withRouter(SongDetails);