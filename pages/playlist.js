import { AppContext } from '../context.js';
import { renderText, handleNewLine } from '../utilities/all.js';

import Artist from '../components/artist.js';
import ErrorCard from '../components/error.js';
import Song from '../components/song.js';
import Button from '../components/button.js';
import Spinner from '../components/loadings/spinner.js';

class PlaylistDetails extends Component {
	static contextType = AppContext;
	
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			errorMessage: null,
		};
		this.abortController = null;
	}
	
	componentDidMount() {
		const { playlistId } = this.props.match.params;
		if (!this.context.specificPlaylistDetails || this.context.specificPlaylistDetails.id !== playlistId) {
			this.fetchPlaylist(playlistId);
		} else {
			this.setLoading(false);
			this.setError(false);
		}
	}
	
	componentDidUpdate(prevProps) {
		const currentPlaylistId = this.props.match.params.playlistId;
		const previousPlaylistId = prevProps.match.params.playlistId;
		
		if (currentPlaylistId !== previousPlaylistId) {
			this.fetchPlaylist(currentPlaylistId);
		}
	}
	
	componentWillUnmount() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}
	
	setLoading = (bool) => {
		this.setState({ loading: bool });
	};
	
	setError = (bool, message = "") => {
		this.setState({ error: bool, errorMessage: message });
	};

	fetchPlaylist = async (playlistId) => {
		this.setLoading(true);
		const decodedPlaylistId = decodeURIComponent(playlistId);
		this.abortController = new AbortController();
		const { signal } = this.abortController;
		
		try {
			const { endpoints } = this.context;
			const isUrl = decodedPlaylistId.startsWith("https://www.jiosaavn.com/") || decodedPlaylistId.startsWith("https://");
			const apiUrl = isUrl ?
				`${endpoints.playlists}?link=${encodeURIComponent(decodedPlaylistId)}` :
				`${endpoints.playlists}?id=${decodedPlaylistId}&limit=99`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(true, data.message || "No song found");
			} else {
				const filtered = Array.isArray(data.data) ? data.data[0] : data.data;
				this.context.setSpecificPlaylistDetails(filtered);
				this.setLoading(false);
				this.setError(false);
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				this.setError(true, error.message);
			}
		}
	};
	
	playWholePlaylist = () => {
		const { specificPlaylistDetails, updatePlayList, playerMethods } = this.context;
		
		const playlist = specificPlaylistDetails.songs.length ?
			specificPlaylistDetails.songs.map((song, index) => ({
				id: song.id,
				name: renderText(song.name),
				artist: renderText(song.artists.primary[0].name),
				album: renderText(song.album.name),
				year: song.year,
				sources: song.downloadUrl,
				coverSm: song.image[1].url,
				coverBg: song.image[song.image.length - 1].url,
			})) :
			null;
		
		if (playlist) {
			updatePlayList(playlist);
			setTimeout(() => playerMethods.setTrack(0), 100);
		}
	}
	
	shareThisPlaylist = async () => {
		if (!'share' in navigator) {
			this.context.notify('error', "Sharing is not supported on this device!");
		}
		
		const { specificPlaylistDetails } = this.context;
		if (!specificPlaylistDetails) return;
		
		try {
			const title = "Check this Playlist out on Ripple!";
			const text = specificPlaylistDetails.name;
			const url = `https://nikhil-sha.github.io/Ripple/#/album/${specificPlaylistDetails.id}`;
			
			await navigator.share({ title, text, url });
		} catch (err) {
			this.context.notify('error', err.message)
		}
	};
	
	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificPlaylistDetails } = this.context;
		if (loading) {
			return e("div", { className: "animate-fade-in w-full h-full flex flex-col items-center justify-center gap-4" },
				e(Spinner, { size: "12", strokeColor: "yellow-400" }),
				e("span", null,
					"Wait a moment…"
				)
			)
		}
		
		if (error) {
			return e(ErrorCard, { errorContext: this.state.errorMessage })
		}
		
		return e("section", { className: "max-w-lg animate-fade-in-up min-h-0 w-full mx-auto" },
			e("figure", { className: "relative w-full h-fit" },
				e("img", {
					src: specificPlaylistDetails.image?.[specificPlaylistDetails.image.length - 1].url || "./assets/images/icons/512.png",
					alt: specificPlaylistDetails.name,
					className: "w-full aspect-square"
				}),
				e("figcaption", { className: "absolute bottom-0 w-full pt-6 bg-gradient-to-t from-neutral-950 to-transparent" },
					e("h2", { className: "sr-only" }, specificPlaylistDetails.name)
				)
			),
			
			e("div", { className: "w-full px-3 md:px-8 lg:px-12" },
				e("p", { className: "text-sm text-neutral-400 font-normal" }, handleNewLine(renderText(specificPlaylistDetails.description))),
				
				e("div", { className: "relative w-full flex flex-row justify-between gap-4 items-center mt-5" },
					e(Button, {
						icon: "share",
						accent: "yellow",
						roundness: "full",
						label: "Share this album",
						clickHandler: this.shareThisPlaylist
					}),
					
					e("div", { className: "max-w-1/2 min-w-24 h-8 inline-flex justify-center gap-1 items-center border border-neutral-700 rounded-full text-sm text-neutral-400 px-3" },
						e("span", { className: "truncate" }, specificPlaylistDetails.songCount ? (specificPlaylistDetails.songCount > 1 ? `${specificPlaylistDetails.songCount} Songs` : `${specificPlaylistDetails.songCount} Song`) : "No Song"),
						e("span", null, "•"),
						e("span", { className: "truncate" }, specificPlaylistDetails.playCount ? (specificPlaylistDetails.playCount > 1 ? `Played ${specificPlaylistDetails.playCount} times` : `Played ${specificPlaylistDetails.playCount} time`) : "Played N/A times")
					),
					
					e(Button, {
						icon: "play",
						accent: "yellow",
						roundness: "full",
						label: "Play this album",
						clickHandler: this.playWholePlaylist
					})
				)
			),
			
			e("div", { className: "w-full mt-8 mb-4 px-3 md:px-8 lg:px-12" },
				e("div", { className: "flex flex-wrap justify-center gap-2 text-sm text-neutral-400" },
					e("a", { className: "text-blue-400 hover:underline", href: specificPlaylistDetails.url },
						"Listen to it on JioSaavn ",
						e("i", { className: "fa-solid fa-external-link" })
					)
				),
				
				specificPlaylistDetails.songs && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Songs"),
					e("div", { className: "max-w-md flex flex-col gap-2 mx-auto mb-8" },
						specificPlaylistDetails.songs.length ?
						specificPlaylistDetails.songs.map((song, index) =>
							e(Song, {
								key: song.id,
								id: song.id,
								name: renderText(song.name),
								artist: renderText(song.artists.primary[0].name),
								album: renderText(song.album.name),
								year: song.year,
								coverSm: song.image[1].url,
								coverBg: song.image[song.image.length - 1].url,
								sources: song.downloadUrl,
								option: "save"
							})
						) :
						e("p", { className: "text-sm text-neutral-400" }, "No Songs Found!")
					)
				),
				
				specificPlaylistDetails.artists && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Artists"),
					e("div", { className: "w-full flex gap-4 overflow-x-auto mb-8" },
						specificPlaylistDetails.artists.length ?
						specificPlaylistDetails.artists.map((artist, index) =>
							e(Artist, {
								key: index,
								id: artist.id,
								name: artist.name,
								image: artist.image.length ? artist.image[artist.image.length - 1].url : '',
								role: artist.role
							})
						) :
						e("p", { className: "text-sm text-neutral-400" }, "No Similar Artists Found!")
					)
				)
			)
		)
	}
}

export default withRouter(PlaylistDetails);