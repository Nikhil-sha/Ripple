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

	componentDidMount() {
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
		const { updatePlayList, savedTracks, addToNotification } = this.context;
		savedTracks.length === 0 ? addToNotification("warning", "There are no saved tracks to play.") : updatePlayList(savedTracks);
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
			<Fragment>
				<h2 className="mb-4 text-2xl font-bold text-neutral-300">Saved Tracks</h2>
				<div className="mb-6 max-w-lg mx-auto flex flex-col gap-4">
					<span className="p-3 block text-neutral-300 text-center rounded-lg bg-neutral-700/50 text-sm flex justify-center items-center font-semibold">Saved: {this.state.limit.occupied} track(s)</span>
					<span className="p-3 block text-neutral-300 text-center rounded-lg bg-neutral-700/50 text-sm flex justify-center items-center font-semibold">Available: {this.state.limit.available} track(s)</span>
					<span className="p-3 block text-neutral-300 text-center rounded-lg bg-neutral-700/50 text-sm flex justify-center items-center font-semibold">Total: {this.state.limit.total} track(s)</span>
					<button onClick={this.playAll} className="p-3 block text-white text-center rounded-lg bg-blue-400 hover:bg-blue-500 transition text-sm flex justify-center items-center font-semibold"><i className="fas fa-play mr-3"></i>Play All</button>
				</div>
				<div className="max-w-md flex flex-col gap-2 mx-auto">
					{savedTracks.length > 0 ? savedTracks.map((track, index) => (
						<Song key={index} songId={track.id} name={track.name} artist={track.artist} coverSm={track.coverSm} coverBg={track.coverBg} sources={track.sources} option="delete" />
					)) : (
						<div className="flex justify-center items-center text-center text-neutral-400">
							<h2>You haven't saved any song yet!</h2>
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

export default Saved;