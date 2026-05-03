import { AppContext } from '../context.js';
import { renderText } from '../utilities/all.js';

import Artist from '../components/artist.js';
import ErrorCard from '../components/error.js';
import Song from '../components/song.js';
import Button from '../components/button.js';
import Spinner from '../components/loadings/spinner.js';

class AlbumDetails extends Component {
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
		const { albumId } = this.props.match.params;
		if (!this.context.specificAlbumDetails || this.context.specificAlbumDetails.id !== albumId) {
			this.fetchAlbum(albumId);
		} else {
			this.setLoadingFalse();
			this.setErrorFalse();
		}
	}
	
	componentDidUpdate(prevProps) {
		const currentAlbumId = this.props.match.params.albumId;
		const previousAlbumId = prevProps.match.params.albumId;
		
		if (currentAlbumId !== previousAlbumId) {
			this.fetchAlbum(currentAlbumId);
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
	
	fetchAlbum = async (albumId) => {
		this.setLoadingTrue();
		const decodedAlbumId = decodeURIComponent(albumId);
		this.abortController = new AbortController();
		const { signal } = this.abortController;
		
		try {
			const { endpoints } = this.context;
			const isUrl = decodedAlbumId.startsWith("https://www.jiosaavn.com/") || decodedAlbumId.startsWith("https://");
			const apiUrl = isUrl ?
				`${endpoints.albums}?link=${encodeURIComponent(decodedAlbumId)}` :
				`${endpoints.albums}?id=${decodedAlbumId}`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(data.message || "No song found");
			} else {
				const filtered = Array.isArray(data.data) ? data.data[0] : data.data;
				this.context.setSpecificAlbumDetails(filtered);
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
	
	playWholeAlbum = () => {
		const { specificAlbumDetails, updatePlayList, playerMethods } = this.context;
		
		const albumToPlaylist = specificAlbumDetails.songs.length ?
			specificAlbumDetails.songs.map((song, index) => ({
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
		
		if (albumToPlaylist) {
			updatePlayList(albumToPlaylist);
			setTimeout(() => playerMethods.setTrack(0), 100);
		}
	}
	
	shareThisAlbum = async () => {
		if (!'share' in navigator) {
			this.context.notify('error', "Sharing is not supported on this device!");
		}
		
		const { specificAlbumDetails } = this.context;
		if (!specificAlbumDetails) return;
		
		try {
			const title = "Check this Album out on Ripple!";
			const text = specificAlbumDetails.name;
			const url = `https://nikhil-sha.github.io/Ripple/#/album/${specificAlbumDetails.id}`;
			
			await navigator.share({ title, text, url });
		} catch (err) {
			this.context.notify('error', err.message)
		}
	};
	
	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificAlbumDetails } = this.context;
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
					src: specificAlbumDetails.image[specificAlbumDetails.image.length - 1].url,
					alt: specificAlbumDetails.name,
					className: "w-full aspect-square"
				}),
				e("figcaption", { className: "absolute bottom-0 w-full px-3 md:px-8 lg:px-12 pt-12 bg-gradient-to-t from-neutral-950 to-transparent" },
					e("h2", { className: "text-2xl text-neutral-200 font-medium" }, specificAlbumDetails.name)
				)
			),
			
			e("div", { className: "w-full px-3 md:px-8 lg:px-12" },
				e("p", { className: "text-sm text-neutral-400 font-normal" }, specificAlbumDetails.description),
				
				e("div", { className: "relative w-full flex flex-row justify-between gap-4 items-center mt-5" },
					e(Button, {
						icon: "share",
						accent: "yellow",
						roundness: "full",
						label: "Share this album",
						clickHandler: this.shareThisAlbum
					}),
					
					e("div", { className: "max-w-1/2 min-w-24 h-8 inline-flex justify-center gap-1 items-center border border-neutral-700 rounded-full text-sm text-neutral-400 px-3" },
						e("span", { className: "truncate" }, specificAlbumDetails.songCount ? (specificAlbumDetails.songCount > 1 ? `${specificAlbumDetails.songCount} Songs` : `${specificAlbumDetails.songCount} Song`) : "No Song"),
						e("span", null, "•"),
						e("span", { className: "truncate" }, specificAlbumDetails.playCount ? (specificAlbumDetails.playCount > 1 ? `Played ${specificAlbumDetails.playCount} times` : `Played ${specificAlbumDetails.playCount} time`) : "Played N/A times")
					),
					
					e(Button, {
						icon: "play",
						accent: "yellow",
						roundness: "full",
						label: "Play this album",
						clickHandler: this.playWholeAlbum
					})
				)
			),
			
			e("div", { className: "w-full mt-8 mb-4 px-3 md:px-8 lg:px-12" },
				e("div", { className: "flex flex-wrap justify-center gap-2 text-sm text-neutral-400" },
					e("a", { className: "text-blue-400 hover:underline", href: specificAlbumDetails.url },
						"Listen to it on JioSaavn ",
						e("i", { className: "fa-solid fa-external-link" })
					)
				),
				
				specificAlbumDetails.songs && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Songs"),
					e("div", { className: "max-w-md flex flex-col gap-2 mx-auto mb-8" },
						specificAlbumDetails.songs.length ?
						specificAlbumDetails.songs.map((song, index) =>
							e(Song, {
								key: song.id,
								songId: song.id,
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
				
				specificAlbumDetails.artists && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Artists"),
					e("div", { className: "w-full flex gap-4 overflow-x-auto mb-8" },
						specificAlbumDetails.artists.all.length ?
						specificAlbumDetails.artists.all.map((artist, index) =>
							e(Artist, {
								key: index,
								artistId: artist.id,
								name: artist.name,
								image: artist.image.length ? artist.image[artist.image.length - 1].url : '',
								role: artist.dominantType
							})
						) :
						e("p", { className: "text-sm text-neutral-400" }, "No Similar Artists Found!")
					)
				)
			)
		)
	}
}

export default withRouter(AlbumDetails);