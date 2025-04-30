import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';
import Song from '../components/song.js';

class Saved extends Component {
	static contextType = AppContext;

	state = {
		chunk: {
			offset: 0,
			length: 6,
		},
		limit: {
			total: 0,
			occupied: 0,
			available: 0,
		},
	}

	async componentDidMount() {
		await this.context.loadSavedTracks();
		const { savedTracks } = this.context;
		if (!savedTracks || savedTracks.length === 0) {
			this.context.loadSavedTracks();
		}
		this.calculateLimitUsage();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.limit.occupied !== this.context.savedTracks.length) {
			this.calculateLimitUsage();
		}
	}

	playAll = () => {
		const { updatePlayList, savedTracks, notify, playerMethods } = this.context;
		savedTracks.length === 0 ? notify("warning", "There are no saved tracks to play.") : updatePlayList(savedTracks);
		setTimeout(() => playerMethods.setTrack(0), 100);
	};

	calculateLimitUsage = () => {
		const { limitForSaved } = this.context;
		const { savedTracks } = this.context;

		const total = limitForSaved;
		const available = total - savedTracks.length;

		this.setState({
			limit: {
				total: total,
				occupied: savedTracks.length,
				available: available,
			}
		});
	};

	loadChunk = (dir) => {
		const { savedTracks } = this.context;

		this.setState(prevState => {
			const { offset, length } = prevState.chunk;
			let newOffset = offset;

			if (dir === 'frwrd' && offset + length < savedTracks.length) {
				newOffset = offset + length;
			} else if (dir === 'bkwrd' && offset > 0) {
				newOffset = Math.max(offset - length, 0);
			} else {
				this.context.notify("error", "Boundary reached.");
				return null;
			}

			return {
				chunk: {
					offset: newOffset,
					length,
				}
			};
		});
	};

	render() {
		let { savedTracks } = this.context;
		let { chunk } = this.state;

		return (
			<section className="animate-fade-in-up min-h-0 w-full px-4 md:px-8 lg:px-12 pt-4">
				<div className="mb-6 max-w-lg mx-auto flex flex-col gap-4">
					<div className="w-full flex items-center justify-center">
						<span key={this.state.limit.occupied} className="animate-fade-in py-5 diagonal-fractions drop-shadow-lg text-center text-9xl font-black text-yellow-400">
							{this.state.limit.occupied}/{this.state.limit.total}
						</span>
					</div>
					<button onClick={this.playAll} className="p-3 block text-white text-center rounded-lg bg-blue-400 hover:bg-blue-500 transition text-sm flex justify-center items-center font-medium"><i className="fas fa-play mr-3"></i>Play All</button>
				</div>
				<div className="animate-fade-in-up max-w-md flex flex-col gap-2 mx-auto">
					{savedTracks.length > 0 ? savedTracks.slice(chunk.offset, chunk.offset + chunk.length).map((track, index) => (
						<Song key={track.id} songId={track.id} name={track.name} artist={track.artist} coverSm={track.coverSm} coverBg={track.coverBg} sources={track.sources} tailwind="animate-fade-in" option="delete" />
					)) : (
						<div className="animate-fade-in flex justify-center items-center text-center text-neutral-600">
							<h2>You haven't saved any song yet!</h2>
						</div>
					)}
					{savedTracks.length ? <div className="flex items-center justify-center gap-4 my-4" role="navigation" aria-label="Pagination Navigation">
						<button onClick={() => this.loadChunk("bkwrd")} className="px-3 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-yellow-400 transition-all duration-200 active:scale-95" aria-label="Previous page">
							<i className="fas fa-chevron-left" aria-hidden="true"></i>
						</button>
						<span className="text-base font-normal text-neutral-800">
							{(chunk.offset / chunk.length + 1)} out of {Math.ceil(savedTracks.length / chunk.length)}
						</span>
						<button onClick={() => this.loadChunk("frwrd")} className="px-3 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-yellow-400 transition-all duration-200 active:scale-95" aria-label="Next page">
							<i className="fas fa-chevron-right" aria-hidden="true"></i>
						</button>
					</div> : ""}
				</div>
			</section>
		);
	}
}

export default Saved;