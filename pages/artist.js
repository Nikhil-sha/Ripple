import { AppContext } from '../context.js';
import { formatDate, capitalize, renderText, handleNewLine } from '../utilities/all.js';

import Song from '../components/song.js';
import Artist from '../components/artist.js';
import Album from '../components/album.js';
import ErrorCard from '../components/error.js';
import Button from '../components/button.js';
import Spinner from '../components/loadings/spinner.js';

class ArtistDetails extends Component {
	static contextType = AppContext;
	
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			errorMessage: null,
			isExternalsVisible: false,
			willExternalsHide: null,
			externalsButton: true
		};
		this.abortController = null;
		this.externalsUnmountTimeout = null;
	}
	
	componentDidMount() {
		const { artistId } = this.props.match.params;
		if (!this.context.specificArtistDetails || this.context.specificArtistDetails.id !== artistId) {
			this.fetchArtist(artistId);
		} else {
			this.setLoadingFalse();
			this.setErrorFalse();
		}
	}
	
	componentDidUpdate(prevProps) {
		const currentArtistId = this.props.match.params.artistId;
		const previousArtistId = prevProps.match.params.artistId;
		
		if (currentArtistId !== previousArtistId) {
			this.fetchArtist(currentArtistId);
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
	
	setArtist = (data) => {
		this.context.setSpecificArtistDetails(data);
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
	
	fetchArtist = async (artistId) => {
		this.setLoadingTrue();
		const decodedArtistId = decodeURIComponent(artistId);
		this.abortController = new AbortController();
		const { signal } = this.abortController;
		
		try {
			const { endpoints } = this.context;
			const isUrl = decodedArtistId.startsWith("https://www.jiosaavn.com/") || decodedArtistId.startsWith("https://");
			const apiUrl = `${endpoints.artists}/${decodedArtistId}?songCount=15&albumCount=10`;
			
			const response = await fetch(apiUrl, { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(data.message || "No artist found");
			} else {
				this.setArtist(Array.isArray(data.data) ? data.data[0] : data.data);
				this.setLoadingFalse();
				this.setErrorFalse();
			}
		} catch (error) {
			if (error.name !== "AbortError") this.setError(error.message);
		}
	};
	
	shareThisArtist = async () => {
		if (!'share' in navigator) {
			this.context.notify('error', "Sharing is not supported on this device!");
		}
		
		const { specificArtistDetails } = this.context;
		if (!specificArtistDetails) return;
		
		try {
			const title = "Check this Artist out on Ripple!";
			const text = specificArtistDetails.name;
			const url = `https://nikhil-sha.github.io/Ripple/#/artist/${specificArtistDetails.id}`;
			
			await navigator.share({ title, text, url });
		} catch (err) {
			this.context.notify('error', err.message)
		}
	};
	
	handleExternalsToggle = () => {
		if (this.externalsUnmountTimeout) {
			clearTimeout(this.externalsUnmountTimeout);
		}
		
		if (this.state.isExternalsVisible) {
			this.setState({
				willExternalsHide: true,
				externalsButton: false
			});
			this.externalsUnmountTimeout = setTimeout(() => this.setState({
				isExternalsVisible: false,
				externalsButton: true
			}), 300);
		} else {
			this.setState((prevState) => ({
				willExternalsHide: false,
				isExternalsVisible: true,
			}));
		}
	};
	
	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificArtistDetails } = this.context;
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
					src: specificArtistDetails.image[specificArtistDetails.image.length - 1].url,
					alt: specificArtistDetails.name,
					className: "w-full aspect-square"
				}),
				e("figcaption", { className: "absolute bottom-0 w-full px-3 md:px-8 lg:px-12 pt-12 bg-gradient-to-t from-neutral-950 to-transparent" },
					e("h2", { className: "text-2xl text-neutral-200 font-medium" }, specificArtistDetails.name)
				)
			),
			
			e("div", { className: "w-full px-3 md:px-8 lg:px-12" },
				e("p", { className: "text-sm text-neutral-400 font-normal" },
					specificArtistDetails.isVerified ? "Verified • " : null,
					specificArtistDetails.isRadioPresent ? "Present on Radio • " : null,
					specificArtistDetails.fanCount, " fans & ", specificArtistDetails.followerCount, " followers"
				),
				
				e("div", { className: "relative w-full flex flex-row justify-between gap-4 items-center mt-5" },
					e(Button, {
						icon: "ellipsis-vertical",
						accent: "yellow",
						roundness: "full",
						label: "Visit artist on others sites",
						clickHandler: this.handleExternalsToggle,
						disabled: !this.state.externalsButton
					}),
					
					e("ul", {
							className: `${this.state.isExternalsVisible ? "" : "hidden"} origin-top-left ${this.state.willExternalsHide ? "animate-scale-down" : "animate-scale-up"} w-fit border p-3 absolute top-full left-0 z-10 text-sm text-neutral-200 bg-neutral-800 rounded-2xl shadow-lg shadow-neutral-900/80 border-neutral-700 flex flex-col mt-3 overflow-hidden`
						},
						specificArtistDetails.wiki ? e("li", null, e("a", { className: "hover:underline", target: "_blank", href: specificArtistDetails.wiki }, "Visit on Wikipedia")) : "",
						specificArtistDetails.url ? e("li", null, e("a", { className: "hover:underline", target: "_blank", href: specificArtistDetails.url }, "Visit on JioSaavn")) : "",
						specificArtistDetails.twitter ? e("li", null, e("a", { className: "hover:underline", target: "_blank", href: specificArtistDetails.twitter }, "Visit on Twitter")) : "",
						specificArtistDetails.fb ? e("li", null, e("a", { className: "hover:underline", target: "_blank", href: specificArtistDetails.fb }, "Visit on Facebook")) : ""
					),
					
					e("div", { className: "max-w-1/2 min-w-24 h-8 inline-flex justify-center gap-1 items-center border border-neutral-700 rounded-full text-sm text-neutral-400 px-3" },
						e("span", { className: "truncate" }, capitalize(specificArtistDetails.dominantType)),
						e("span", null, "•"),
						e("span", { className: "truncate" }, capitalize(specificArtistDetails.dominantLanguage))
					),
					
					e(Button, {
						icon: "share",
						accent: "yellow",
						roundness: "full",
						label: "Share this artist",
						clickHandler: this.shareThisArtist
					})
				)
			),
			
			e("div", { className: "w-full mt-8 mb-4 px-3 md:px-8 lg:px-12" },
				specificArtistDetails.dob ? e("p", { className: "text-sm text-neutral-400" }, "Born on ", formatDate(specificArtistDetails.dob.split("-").reverse().join("-"))) : null,
				
				specificArtistDetails.bio && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Bio"),
					specificArtistDetails.bio.length ? specificArtistDetails.bio.sort((a, b) => a.i - b.i).map((text, index) =>
						e("details", {
								className: `${(specificArtistDetails.bio.length - 1) !== index ? "mb-2" : ""} group marker:content-none px-3 py-2 border border-neutral-800 rounded-xl bg-neutral-900`,
								key: index
							},
							e("summary", { className: "flex justify-between items-center" },
								e("span", { className: "text-base text-200" }, text.title),
								e("i", { className: "group-open:rotate-180 text-neutral-400 fa-solid fa-chevron-down" })
							),
							e("hr", { className: "group-open:animate-fade-in border-neutral-700/50 my-3" }),
							e("p", { key: index, className: "group-open:animate-fade-in text-sm text-neutral-300" }, handleNewLine(text.text))
						)
					) : e("p", { className: "text-sm text-neutral-400" }, "No Bio Available!")
				),
				
				specificArtistDetails.availableLanguages && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Available Languages"),
					e("div", { className: "w-full flex gap-2 flex-wrap mb-8" },
						specificArtistDetails.availableLanguages.length ? specificArtistDetails.availableLanguages.filter(element => element !== "unknown").map((language, index) =>
							e("span", {
								className: "px-2 py-1 bg-neutral-800 rounded-lg text-sm font-normal text-neutral-200 hover:text-yellow-400 border border-neutral-700 hover:border-yellow-400",
								key: index
							}, capitalize(language))
						) : e("p", { className: "text-sm text-neutral-400" }, "No Language Available!")
					)
				),
				
				specificArtistDetails.singles && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Top Singles"),
					e("div", { className: "w-full flex gap-4 overflow-x-auto mb-8" },
						specificArtistDetails.singles.length ? specificArtistDetails.singles.map((album, index) =>
							e(Album, {
								key: index,
								albumId: album.id,
								name: album.name,
								cover: album.image.length ? album.image[1].url : ''
							})
						) : e("p", { className: "text-sm text-neutral-400" }, "No Single Available!")
					)
				),
				
				specificArtistDetails.topSongs && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Top Songs"),
					e("div", { className: "max-w-md flex flex-col gap-2 mx-auto mb-8" },
						specificArtistDetails.topSongs.length ? specificArtistDetails.topSongs.map((song, index) =>
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
						) : e("p", { className: "text-sm text-neutral-400" }, "No Songs Found!")
					)
				),
				
				specificArtistDetails.topAlbums && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Top Album"),
					e("div", { className: "w-full flex gap-4 overflow-x-auto mb-8" },
						specificArtistDetails.topAlbums.length ? specificArtistDetails.topAlbums.map((album, index) =>
							e(Album, {
								key: index,
								albumId: album.id,
								name: album.name,
								cover: album.image.length ? album.image[1].url : ''
							})
						) : e("p", { className: "text-sm text-neutral-400" }, "No Album Available!")
					)
				),
				
				specificArtistDetails.similarArtists && e(Fragment, null,
					e("h4", { className: "text-neutral-500 text-base font-normal mt-6 mb-2" }, "Similar Artists"),
					e("div", { className: "w-full flex gap-4 overflow-x-auto mb-8" },
						specificArtistDetails.similarArtists.length ? specificArtistDetails.similarArtists.map((artist, index) =>
							e(Artist, {
								key: index,
								artistId: artist.id,
								name: artist.name,
								image: artist.image.length ? artist.image[artist.image.length - 1].url : '',
								role: artist.dominantType
							})
						) : e("p", { className: "text-sm text-neutral-400" }, "No Similar Artists Found!")
					)
				)
			)
		)
	}
}

export default withRouter(ArtistDetails);