import { AppContext } from '../context.js';
import { formatTime, formatDate, renderText, renderLyrics } from '../utilities/all.js';

import Album from '../components/album.js';
import Artist from '../components/artist.js';
import ErrorCard from '../components/error.js';
import Button from '../components/button.js';
import Spinner from '../components/loadings/spinner.js';

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
			const { endpoints } = this.context;
			const isUrl = decodedSongId.startsWith("https://www.jiosaavn.com/") || decodedSongId.startsWith("https://");
			const apiUrl = isUrl ?
				`${endpoints.songs}?link=${encodeURIComponent(decodedSongId)}` :
				`${endpoints.songs}/${decodedSongId}`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(data.message || "No song found");
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
				this.setError(error.message);
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
			const { endpoints } = this.context;
			const apiUrl = `${endpoints.songs}/${songId}/lyrics`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setLyricsState("error", data.message || "Lyrics not found!");
			} else {
				this.context.setSpecificSongLyrics(songId, data.data);
				this.setLyricsState("success");
			}
		} catch (error) {
			if (error.name === "AbortError") {
				this.setLyricsState("error", "Fetch request was aborted!");
			} else {
				this.setLyricsState("error", error.message);
			}
		}
	};
	
	addToPlayList = () => {
		const { id, name, artists, album, year, downloadUrl, image } = this.context.specificSongDetails;
		const track = {
			id: id,
			name: renderText(name),
			artist: renderText(artists.primary[0].name),
			album: renderText(album.name),
			year: year,
			sources: downloadUrl,
			coverSm: image[0].url,
			coverBg: image[image.length - 1].url,
		};
		this.context.updatePlayList([track, ...this.context.playList]);
		setTimeout(() => this.context.playerMethods.setTrack(0), 100);
	};
	
	saveThis = () => {
		const { id, name, artists, album, year, downloadUrl, image } = this.context.specificSongDetails;
		const track = {
			id: id,
			name: renderText(name),
			artist: renderText(artists.primary[0].name),
			album: renderText(album.name),
			year: year,
			sources: downloadUrl,
			coverSm: image[0].url,
			coverBg: image[image.length - 1].url,
		};
		this.context.updateLocalStorage(track);
	};
	
	render() {
		const { loading, error, errorMessage, lyricsState } = this.state;
		let { specificSongDetails, specificSongLyrics } = this.context;
		if (loading) {
			return e("div", { className: "animate-fade-in w-full h-full flex flex-col items-center justify-center gap-4" },
				e(Spinner, { size: "12", strokeColor: "yellow-400" }),
				e("span", null,
					"Wait a second…"
				)
			)
		}
		
		if (error) {
			return e(ErrorCard, { errorContext: this.state.errorMessage })
		}
		
		return e("section", { className: "max-w-lg animate-fade-in-up min-h-0 w-full mx-auto" },
			e("figure", { className: "relative w-full h-fit" },
				e("img", {
					src: specificSongDetails.image[specificSongDetails.image.length - 1].url,
					alt: specificSongDetails.name,
					className: "w-full aspect-square"
				}),
				e("figcaption", { className: "absolute bottom-0 w-full px-3 md:px-8 lg:px-12 pt-12 bg-gradient-to-t from-neutral-950 to-transparent" },
					e("h2", { className: "text-2xl text-neutral-200 font-medium" }, renderText(specificSongDetails.name))
				)
			),
			
			e("div", { className: "w-full px-3 md:px-8 lg:px-12" },
				e("p", { className: "text-sm text-neutral-400 font-normal" },
					"From ",
					e(Link, { to: `/album/${specificSongDetails.album.id}`, className: "hover:underline" }, renderText(specificSongDetails.album.name)),
					" by ",
					e(Link, { to: `/artist/${specificSongDetails.artists.primary[0].id}`, className: "hover:underline" }, renderText(specificSongDetails.artists.primary[0].name))
				),
				
				e("div", { className: "w-full flex flex-row justify-between gap-4 items-center mt-5" },
					e(Button, {
						icon: "bookmark",
						accent: "yellow",
						roundness: "full",
						label: "Save this song.",
						clickHandler: this.saveThis
					}),
					e("div", { className: "max-w-1/2 min-w-24 h-8 inline-flex justify-center gap-1 items-center border border-neutral-700 rounded-full text-sm text-neutral-400 px-3" },
						e("span", { className: "truncate" }, specificSongDetails.label),
						e("span", null, "•"),
						e("span", null, specificSongDetails.year)
					),
					e(Button, {
						icon: "play ml-0.5",
						accent: "yellow",
						roundness: "full",
						label: "Play this song",
						clickHandler: this.addToPlayList
					})
				)
			),
			
			e("div", { className: "w-full mt-8 mb-4 px-3 md:px-8 lg:px-12" },
				e("div", { className: "flex flex-wrap justify-center gap-2 text-sm text-neutral-400" },
					e("span", null, "Released: ", formatDate(specificSongDetails.releaseDate)),
					e("span", null, "Language: ", specificSongDetails.language),
					e("span", null, "Played: ", specificSongDetails.playCount, " times"),
					e("span", null, "Playtime: ", formatTime(specificSongDetails.duration)),
					e("a", { className: "text-blue-400 hover:underline", href: specificSongDetails.url },
						"Listen to it on JioSaavn ",
						e("i", { className: "fa-solid fa-external-link" })
					)
				),
				
				e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Lyrics"),
				lyricsState.status === "loading" ? (
					e("div", { className: "animate-fade-in w-fit mx-auto flex justify-center items-center" },
						e(Spinner, { size: "4", strokeColor: "yellow-400" }),
						e("span", { className: "ml-2 text-sm" }, "Loading…")
					)
				) : lyricsState.status === "error" ? (
					e("p", { className: "text-sm text-neutral-400" }, lyricsState.message)
				) : specificSongLyrics && specificSongLyrics.id === specificSongDetails.id ? (
					e("div", { className: "mb-8" },
						e("p", { className: "text-sm text-neutral-200" }, renderLyrics(specificSongLyrics.lyrics.lyrics)),
						e("p", { className: "text-sm text-neutral-400 font-medium" }, renderLyrics(specificSongLyrics.lyrics.copyright))
					)
				) : specificSongDetails.hasLyrics ? (
					e("button", {
						onClick: this.loadLyrics,
						className: "px-2 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 rounded-md text-neutral-600"
					}, "Load lyrics")
				) : (
					e("p", { className: "text-sm text-neutral-400" }, "Lyrics Unavailable for this song.")
				),
				
				e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Album"),
				e(Album, {
					name: specificSongDetails.album.name,
					cover: specificSongDetails.image[1].url,
					albumId: specificSongDetails.album.id
				}),
				
				e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Artists"),
				e("div", { className: "w-full flex gap-4 mb-8 overflow-x-auto" },
					specificSongDetails.artists.all ? specificSongDetails.artists.all.map((artist, index) =>
						e(Artist, {
							key: index,
							artistId: artist.id,
							name: artist.name,
							image: artist.image.length ? artist.image[artist.image.length - 1].url : '',
							role: artist.role
						})
					) : ""
				)
			),
			
			e("p", { className: "text-center text-sm font-medium text-neutral-600" },
				specificSongDetails.label, " - ", specificSongDetails.copyright
			)
		)
	}
}

export default withRouter(SongDetails);