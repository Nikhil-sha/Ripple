import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';
import Song from '../components/song.js';

class Saved extends Component {
	static contextType = AppContext;

	state = {
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

	render() {
		let { savedTracks } = this.context;

		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<div className="mb-6 max-w-lg mx-auto flex flex-col gap-4">
					<div className="w-full flex items-center justify-center">
						<span key={this.state.limit.occupied} className="fade_in py-5 diagonal-fractions drop-shadow-lg text-center text-9xl font-black text-yellow-400">
							{this.state.limit.occupied}/{this.state.limit.total}
						</span>
					</div>
					<button onClick={this.playAll} className="p-3 block text-white text-center rounded-lg bg-blue-400 hover:bg-blue-500 transition text-sm flex justify-center items-center font-medium"><i className="fas fa-play mr-3"></i>Play All</button>
				</div>
				<div className="fade_in_up max-w-md flex flex-col gap-2 mx-auto">
					{savedTracks.length > 0 ? savedTracks.map((track, index) => (
						<Song key={index} songId={track.id} name={track.name} artist={track.artist} coverSm={track.coverSm} coverBg={track.coverBg} sources={track.sources} option="delete" />
					)) : (
						<div className="fade_in flex justify-center items-center text-center text-neutral-600">
							<h2>You haven't saved any song yet!</h2>
						</div>
					)}
				</div>
			</section>
		);
	}
}

export default Saved;