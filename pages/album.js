import React, { Component, Fragment } from "react";
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

import Artist from '../components/artist.js';
import Song from '../components/song.js';

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
				`${endpoints[0].albums}?link=${encodeURIComponent(decodedAlbumId)}` :
				`${endpoints[0].albums}?id=${decodedAlbumId}`;

			const response = await fetch(apiUrl, { signal });
			const data = await response.json();

			if (!data.success) {
				this.setError("No song found");
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
				this.setError("API failure");
			}
		}
	};

	render() {
		const { loading, error, errorMessage } = this.state;
		let { specificAlbumDetails } = this.context;
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
					<img src={specificAlbumDetails.image[specificAlbumDetails.image.length - 1].url} alt={specificAlbumDetails.name} className="w-2/4 md:w-1/4 aspect-square rounded-lg" />
					<figcaption className="mt-4 text-center">
						<h2 className="text-2xl text-neutral-800 font-bold mb-1">{specificAlbumDetails.name}</h2>
						<p className="text-sm text-neutral-600 font-semibold">{specificAlbumDetails.description}</p>
						<span className="leading-none text-sm text-neutral-400">{specificAlbumDetails.songCount} Songs</span>
					</figcaption>
				</figure>
				
				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<h3 className="text-lg font-semibold text-neutral-600">More about {specificAlbumDetails.name}</h3>
					<div className="mt-3">
						<h4 className="text-base text-neutral-800 font-semibold mt-4 mb-2">External Links</h4>
						<div className="w-full flex flex-col gap-2 flex-wrap mb-8">
							{specificAlbumDetails.url ? <a className="w-fit text-neutral-700 group inline-flex items-center hover:underline" target="_blank" href={specificAlbumDetails.url}><svg xmlns="http://www.w3.org/2000/svg" className="size-[22px] group-hover:text-blue-400 mr-2" fill="currentColor" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50"><path d="M 14 4.9902344 C 9.03 4.9902344 5 9.0202344 5 13.990234 L 5 35.990234 C 5 40.960234 9.03 44.990234 14 44.990234 L 30.210938 44.990234 C 29.580938 43.770234 29.180781 42.42 29.050781 41 L 27.529297 41 C 26.719297 41 26.280078 40.029687 26.830078 39.429688 C 27.560078 38.629688 28.440391 37.830078 29.400391 37.080078 C 30.680391 32.430078 34.96 29 40 29 C 41.8 29 43.5 29.440938 45 30.210938 L 45 13.990234 C 45 9.0202344 40.97 4.9902344 36 4.9902344 L 14 4.9902344 z M 14.650391 9 C 14.870391 9 15.060156 9.1205469 15.160156 9.3105469 C 18.090156 15.400547 23.119141 29.299688 23.119141 38.179688 C 28.749141 26.099688 28.880938 15.400781 28.210938 10.050781 C 28.140937 9.4907812 28.580625 9 29.140625 9 L 35.349609 9 C 38.469609 9 41 11.530391 41 14.650391 L 41 20.429688 C 41 20.829687 40.739141 21.170547 40.369141 21.310547 C 37.559141 22.390547 26.239844 29.6 25.089844 41 L 22.080078 41 C 20.920078 30.42 13.909297 20.749297 9.5292969 18.779297 C 9.1992969 18.639297 9 18.299453 9 17.939453 L 9 14.650391 C 9 11.530391 11.530391 9 14.650391 9 z M 40 31 C 35.05 31 31 35.05 31 40 C 31 44.95 35.05 49 40 49 C 44.95 49 49 44.95 49 40 C 49 35.05 44.95 31 40 31 z M 10.039062 33.429688 C 13.549062 33.849688 17.799609 36.659687 20.349609 39.429688 C 20.899609 40.029687 20.460625 41 19.640625 41 L 14.650391 41 C 11.530391 41 9 38.469609 9 35.349609 L 9 34.369141 C 9 33.809141 9.4890625 33.359687 10.039062 33.429688 z M 44.619141 35.003906 C 44.742891 35.003906 44.990234 35.059766 44.990234 35.509766 L 44.990234 39.160156 L 44.990234 42.509766 C 44.990234 43.059766 44.3 44.009766 42.75 44.009766 C 41.2 44.009766 41 43.009766 41 42.509766 C 41 41.759766 41.8 41.009766 43 41.009766 C 44.1 41.009766 44 40.709766 44 40.259766 L 44 38.050781 C 44 37.700781 43.999609 37.599219 43.599609 37.699219 C 42.949609 37.849219 39.349219 38.75 39.199219 38.75 C 39.049219 38.8 39 38.899219 39 39.199219 L 39 43.490234 C 39 44.040234 38.3 44.990234 36.75 44.990234 C 35.2 44.990234 35 43.990234 35 43.490234 C 35 42.740234 35.8 41.990234 37 41.990234 C 38.1 41.990234 38 41.690234 38 41.240234 L 38 36.759766 C 38 36.509766 38.099609 36.360547 38.349609 36.310547 C 38.749609 36.210547 44.550781 35.009766 44.550781 35.009766 C 44.550781 35.009766 44.577891 35.003906 44.619141 35.003906 z"></path></svg>JioSaavn</a> : ""}
						</div>
						<h4 className="text-base font-semibold mb-2">Songs</h4>
						{specificAlbumDetails.songs ? (
							specificAlbumDetails.songs.map((song, index) => (
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
							))
						) : (
							<p className="text-sm text-neutral-400">No Songs</p>
						)}
						<h4 className="text-base font-semibold mt-4 mb-2">Artists</h4>
						<div className="w-full flex gap-4 mb-8 overflow-x-auto">
							{specificAlbumDetails.artists.all ? specificAlbumDetails.artists.all.map((artist, index) => (
								<Artist key={index} artistId={artist.id} name={artist.name} image={artist.image.length ? artist.image[artist.image.length - 1].url : ''} role={artist.role} />
							)) : ""}
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default withRouter(AlbumDetails);