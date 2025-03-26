import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Song extends Component {
	static contextType = AppContext;
	
	addToPlayList = (event) => {
		event.stopPropagation();
		const { songId, name, artist, coverSm, coverBg, sources } = this.props;
		const track = {
			id: songId,
			name: name,
			artist: artist,
			sources: sources,
			coverSm: coverSm,
			coverBg: coverBg,
		};
		this.context.updatePlayList([track, ...this.context.playList]); // Updates the playlist context
		setTimeout(() => this.context.playerMethods.setTrack(0), 100);
	};

	saveThis = (event) => {
		event.stopPropagation();
		const { songId, name, artist, coverSm, coverBg, sources } = this.props;
		const track = {
			id: songId,
			name: name,
			artist: artist,
			sources: sources,
			coverSm: coverSm,
			coverBg: coverBg,
		};
		this.context.updateLocalStorage(track);
	};

	deleteThis = () => {
		let confirmation = confirm("Do you really want to remove this song from Saved?");
		if (confirmation) {
			this.context.removeTrackFromLocalStorage(this.props.songId);
		} else {
			return;
		}
	};

	render() {
		const { songId, name, artist, coverSm, option } = this.props;

		return (
			<div className="w-full py-2 px-3 flex items-center gap-3 rounded-md hover:bg-neutral-200/50 transition-colors duration-200">
				<Link to={`/song/${songId}`} className="min-w-0 grow flex items-center gap-3">
					<div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md">
						<img className="w-full h-full object-cover" src={coverSm} alt={`Cover for ${name} by ${artist}`} />
					</div>
					<div className="flex-1 min-w-0">
						<h2 className="text-sm font-normal text-neutral-800 truncate mb-0.5">{name}</h2>
						<p className="text-xs text-neutral-600 truncate">{artist}</p>
					</div>
				</Link>
				<button 
					onClick={this.addToPlayList} 
					className="flex-shrink-0 group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-pink-400 transition-all"
					aria-label={`Add ${name} to your playlist`}
				>
					<i className="fas fa-play pl-0.5 text-neutral-700 group-hover:text-neutral-100"></i>
				</button>
				{option === "save" ?
					<button 
						onClick={this.saveThis} 
						className="flex-shrink-0 group size-8 flex justify-center items-center rounded-full bg-yellow-400 hover:bg-neutral-100 transition-all"
						aria-label={`Save ${name} to your list`}
					>
						<i className="fas fa-bookmark text-neutral-100 group-hover:text-yellow-400"></i>
					</button> : option === "delete" ?
					<button 
						onClick={this.deleteThis} 
						className="flex-shrink-0 group size-8 flex justify-center items-center rounded-full bg-red-400 hover:bg-neutral-100 transition-all"
						aria-label={`Delete ${name}`}
					>
						<i className="fas fa-times text-neutral-100 group-hover:text-red-400"></i>
					</button> : ''
				}
			</div>
		);
	}
}

export default Song;