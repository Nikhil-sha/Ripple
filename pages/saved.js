import React, { Component } from 'react';
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
		const { updatePlayList, savedTracks } = this.context;
		savedTracks.length === 0 ? this.context.addToNotification("warning", "There are no saved tracks to play.") : updatePlayList(savedTracks);
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
			<section className="w-full h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<h2 className="mb-4 text-2xl font-bold text-gray-800">Saved Tracks</h2>
				<div className="mb-6 max-w-lg h-48 mx-auto grid grid-cols-3 grid-rows-3 gap-4">
					<div className="col-span-1 relative h-full rounded-lg bg-gray-200 overflow-hidden">
						<div style={{ height: `${(this.state.limit.occupied / this.state.limit.total * 100)}%` }} className="absolute bottom-0 w-full bg-red-400"></div>
					</div>
					<span className="block col-span-2 text-white text-center rounded-lg bg-yellow-400 text-sm flex justify-center items-center font-semibold">Saved: {this.state.limit.occupied} track(s)</span>
					<span className="block col-span-2 text-white text-center rounded-lg bg-orange-400 text-sm flex justify-center items-center font-semibold">Available: {this.state.limit.available} track(s)</span>
					<span className="block col-span-1 text-white text-center rounded-lg bg-cyan-400 text-sm flex justify-center items-center font-semibold">Total: {this.state.limit.total} track(s)</span>
					<button onClick={this.playAll} className="block col-span-3 text-white text-center rounded-lg bg-blue-400 hover:bg-blue-500 transition text-sm flex justify-center items-center font-semibold"><i className="fas fa-play mr-3"></i>Play All</button>
				</div>
				<div className="max-w-md flex flex-col space-y-2 mx-auto">
					{savedTracks.length > 0 ? savedTracks.map((track) => (
						<Song key={track.id} songId={track.id} name={track.name} artist={track.artist} coverSm={track.coverSm} coverBg={track.coverBg} sources={track.sources} option="delete" />
					)) : (
						<div className="flex justify-center items-center text-center text-gray-400">
							<h2>You haven't saved any song yet!</h2>
						</div>
					)}
				</div>
			</section>
		);
	}
}

export default Saved;