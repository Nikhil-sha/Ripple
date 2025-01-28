import React, { Component } from 'react';
import { AppContext } from '../context';
import Song from '../components/song.js';

class Saved extends Component {
	static contextType = AppContext;

	state = {
		storage: {
			total: 0,
			occupied: 0,
			available: 0,
			valueIn: "KB"
		},
		lazy: {
			BATCH_SIZE: 5,
			startIndex: 0
		},
	}

	componentDidMount() {
		const { savedTracks } = this.context;
		if (!savedTracks || savedTracks.length === 0) {
			this.context.loadSavedTracks();
		}
		this.calculateLocalStorageSpace();
	}

	calculateLocalStorageSpace = () => {
		try {
			if (this.state.storage.total > 0) return;

			const totalSpace = 1 * 1024 * 1024; // Approximate size of localStorage: 1MB
			let usedSpace = 0;

			for (let key in localStorage) {
				if (localStorage.hasOwnProperty(key)) {
					const value = localStorage.getItem(key);
					usedSpace += key.length + (value ? value.length : 0);
				}
			}

			const remainingSpace = totalSpace - usedSpace;

			console.log(`Used space: ${(usedSpace / 1024).toFixed(2)} KB`);
			console.log(`Available space: ${(remainingSpace / 1024).toFixed(2)} KB`);

			this.setState({
				storage: {
					total: (totalSpace / 1024).toFixed(1),
					occupied: (usedSpace / 1024).toFixed(1),
					available: (remainingSpace / 1024).toFixed(1),
					valueIn: "KB",
				}
			});
		} catch (error) {
			console.error("Error calculating localStorage space:", error);
		}
	};

	render() {
		const { storage } = this.state;
		let { savedTracks } = this.context;

		return (
			<section className="w-full h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<h2 className="mb-4 text-2xl font-semibold text-gray-800">Saved Tracks</h2>
				<div className="mb-4 max-w-lg mx-auto">
					<div className="relative w-full h-4 rounded-full bg-gray-300 overflow-hidden mb-2">
						<div style={{ width: `${(storage.occupied / storage.total * 100).toFixed(2)}%` }} className="absolute left-0 h-full rounded-full bg-red-600"></div>
					</div>
					<div className="inline-flex justify-between items-center gap-2 flex-wrap">
						<span className="px-4 py-2 text-white rounded-lg bg-yellow-400 text-xs text-center font-semibold">Songs: {savedTracks.length}</span>
						<span className="px-4 py-2 text-white rounded-lg bg-blue-400 text-xs text-center font-semibold">Occupied: {storage.occupied}{storage.valueIn}</span>
						<span className="px-4 py-2 text-white rounded-lg bg-orange-400 text-xs text-center font-semibold">Available: {storage.available}{storage.valueIn}</span>
						<span className="px-4 py-2 text-white rounded-lg bg-slate-400 text-xs text-center font-semibold">Total: {storage.total}{storage.valueIn}</span>
					</div>
				</div>
				<div className="mb-4 max-w-md mx-auto">
					{savedTracks.length > 0 ? savedTracks.map((track) => (
						<Song key={track.id} songId={track.id} name={track.name} artist={track.artist} coverSm={track.coverSm} coverBg={track.coverBg} src={track.src} option="delete" />
					)) : (
						<div className="text-center text-gray-500">
							<h2>No saved songs!</h2>
						</div>
					)}
				</div>
			</section>
		);
	}
}

export default Saved;