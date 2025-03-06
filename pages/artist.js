import React, { Component, Fragment } from "react";
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

import Song from '../components/song';
import Artist from '../components/artist';

class ArtistDetails extends Component {
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
			const isUrl = decodedArtistId.startsWith("https://www.jiosaavn.com/") || decodedArtistId.startsWith("https://");
			const apiUrl = `https://saavn.dev/api/artists/${decodedArtistId}?songCount=15&albumCount=10`;

			const response = await fetch(apiUrl, { signal });
			const data = await response.json();

			if (!data.success) {
				this.setError("No artist found");
			} else {
				this.setArtist(Array.isArray(data.data) ? data.data[0] : data.data);
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

	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificArtistDetails } = this.context;
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
				<div className="fade_in h-full w-full flex flex-col justify-center items-center">
					<i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
					<h2 className="pt-2 w-64 font-bold leading-none text-lg text-center">Failed to load the artist!</h2>
					<p className="w-64 leading-1 text-sm text-center text-neutral-400">REASON: {errorMessage ? errorMessage : "Don't know what happened!"}</p>
				</div>
			)
		}

		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<figure className="w-full flex flex-col justify-center items-center">
					<div className="relative w-2/4 md:w-1/4 aspect-square rounded-lg overflow-hidden">
						<img src={specificArtistDetails.image[specificArtistDetails.image.length - 1].url} alt={specificArtistDetails.name} className="size-full object-cover" />
						<div className="absolute px-2 py-1 flex flex-col justify-center items-center gap-1 top-1 left-1 rounded-lg bg-black/50">
							{specificArtistDetails.isVerified ? <i className="fas fa-check-circle text-base text-yellow-400"></i> : ""}
							{specificArtistDetails.isRadioPresent ? <i className="fas fa-radio text-base text-blue-400"></i> : ""}
						</div>
					</div>
					<figcaption className="mt-4 text-center">
						<h2 className="flex gap-2 justify-center items-center text-2xl text-neutral-800 font-bold mb-1">{specificArtistDetails.name}</h2>
						<p className="text-sm text-neutral-600 font-semibold">{specificArtistDetails.dominantType} - {specificArtistDetails.dominantLanguage} {specificArtistDetails.dob ? `- ${specificArtistDetails.dob}` : ""}</p>
						<span className="leading-none text-sm text-neutral-400">{specificArtistDetails.followerCount} followers</span>
					</figcaption>
				</figure>

				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<h3 className="text-lg font-semibold text-neutral-600">More about {specificArtistDetails.name}</h3>
					<div className="mt-3">
						{specificArtistDetails.topSongs && <Fragment>
							<h4 className="text-base text-neutral-800 font-semibold mt-4 mb-2">Top Songs</h4>
							<div className="max-w-md flex flex-col gap-2 mx-auto mb-8">
								{specificArtistDetails.topSongs.length ? specificArtistDetails.topSongs.map((song, index) => (
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
								)) : <p className="text-sm text-neutral-400">No songs found!</p>}
							</div>
						</Fragment>}
						<h4 className="text-base text-neutral-800 font-semibold mt-4 mb-2">External Links</h4>
						<div className="w-full flex flex-col gap-2 flex-wrap mb-8">
							{specificArtistDetails.wiki ? <a className="w-fit text-neutral-700 group hover:underline" target="_blank" href={specificArtistDetails.wiki}><span className="text-lg fab fa-wikipedia-w group-hover:text-blue-400 mr-2"></span>Wikipedia</a> : ""}
							{specificArtistDetails.url ? <a className="w-fit text-neutral-700 group inline-flex items-center hover:underline" target="_blank" href={specificArtistDetails.url}><svg xmlns="http://www.w3.org/2000/svg" className="size-[22px] group-hover:text-blue-400 mr-2" fill="currentColor" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50"><path d="M 14 4.9902344 C 9.03 4.9902344 5 9.0202344 5 13.990234 L 5 35.990234 C 5 40.960234 9.03 44.990234 14 44.990234 L 30.210938 44.990234 C 29.580938 43.770234 29.180781 42.42 29.050781 41 L 27.529297 41 C 26.719297 41 26.280078 40.029687 26.830078 39.429688 C 27.560078 38.629688 28.440391 37.830078 29.400391 37.080078 C 30.680391 32.430078 34.96 29 40 29 C 41.8 29 43.5 29.440938 45 30.210938 L 45 13.990234 C 45 9.0202344 40.97 4.9902344 36 4.9902344 L 14 4.9902344 z M 14.650391 9 C 14.870391 9 15.060156 9.1205469 15.160156 9.3105469 C 18.090156 15.400547 23.119141 29.299688 23.119141 38.179688 C 28.749141 26.099688 28.880938 15.400781 28.210938 10.050781 C 28.140937 9.4907812 28.580625 9 29.140625 9 L 35.349609 9 C 38.469609 9 41 11.530391 41 14.650391 L 41 20.429688 C 41 20.829687 40.739141 21.170547 40.369141 21.310547 C 37.559141 22.390547 26.239844 29.6 25.089844 41 L 22.080078 41 C 20.920078 30.42 13.909297 20.749297 9.5292969 18.779297 C 9.1992969 18.639297 9 18.299453 9 17.939453 L 9 14.650391 C 9 11.530391 11.530391 9 14.650391 9 z M 40 31 C 35.05 31 31 35.05 31 40 C 31 44.95 35.05 49 40 49 C 44.95 49 49 44.95 49 40 C 49 35.05 44.95 31 40 31 z M 10.039062 33.429688 C 13.549062 33.849688 17.799609 36.659687 20.349609 39.429688 C 20.899609 40.029687 20.460625 41 19.640625 41 L 14.650391 41 C 11.530391 41 9 38.469609 9 35.349609 L 9 34.369141 C 9 33.809141 9.4890625 33.359687 10.039062 33.429688 z M 44.619141 35.003906 C 44.742891 35.003906 44.990234 35.059766 44.990234 35.509766 L 44.990234 39.160156 L 44.990234 42.509766 C 44.990234 43.059766 44.3 44.009766 42.75 44.009766 C 41.2 44.009766 41 43.009766 41 42.509766 C 41 41.759766 41.8 41.009766 43 41.009766 C 44.1 41.009766 44 40.709766 44 40.259766 L 44 38.050781 C 44 37.700781 43.999609 37.599219 43.599609 37.699219 C 42.949609 37.849219 39.349219 38.75 39.199219 38.75 C 39.049219 38.8 39 38.899219 39 39.199219 L 39 43.490234 C 39 44.040234 38.3 44.990234 36.75 44.990234 C 35.2 44.990234 35 43.990234 35 43.490234 C 35 42.740234 35.8 41.990234 37 41.990234 C 38.1 41.990234 38 41.690234 38 41.240234 L 38 36.759766 C 38 36.509766 38.099609 36.360547 38.349609 36.310547 C 38.749609 36.210547 44.550781 35.009766 44.550781 35.009766 C 44.550781 35.009766 44.577891 35.003906 44.619141 35.003906 z"></path></svg>JioSaavn</a> : ""}
							{specificArtistDetails.twitter ? <a className="w-fit text-neutral-700 group hover:underline" target="_blank" href={specificArtistDetails.twitter}><span className="text-lg fab fa-twitter group-hover:text-blue-400 mr-2"></span>Twitter</a> : ""}
							{specificArtistDetails.fb ? <a className="w-fit text-neutral-700 group hover:underline" target="_blank" href={specificArtistDetails.fb}><span className="text-lg fab fa-facebook group-hover:text-blue-400 mr-2"></span>Facebook</a> : ""}
						</div>
						{specificArtistDetails.availableLanguages && <Fragment>
							<h4 className="text-base text-neutral-800 font-semibold mt-4 mb-2">Available Languages</h4>
							<div className="w-full flex gap-2 flex-wrap mb-8">
								{specificArtistDetails.availableLanguages.length ? specificArtistDetails.availableLanguages.map((language, index) => (
									<span className="px-1.5 py-0.5 bg-yellow-300 rounded-md shadow-md text-sm font-semibold text-neutral-600" key={index}>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
								)) : <p className="text-sm text-neutral-400">No language available!</p>}
							</div>
						</Fragment>}
						{specificArtistDetails.similarArtists && <Fragment>
							<h4 className="text-base text-neutral-800 font-semibold mt-4 mb-2">Similar Artists</h4>
							<div className="w-full flex gap-4 overflow-x-auto mb-8">
								{specificArtistDetails.similarArtists.length ? specificArtistDetails.similarArtists.map((artist, index) => (
									<Artist key={index} artistId={artist.id} name={artist.name} image={artist.image.length ? artist.image[artist.image.length - 1].url : ''} role={artist.dominantType} />
								)) : <p className="text-sm text-neutral-400">No similar artists found!</p>}
							</div>
						</Fragment>}
					</div>
				</div>

			</section>
		);
	}
}

export default withRouter(ArtistDetails);