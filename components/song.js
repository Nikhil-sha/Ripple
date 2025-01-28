import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Song extends Component {
	static contextType = AppContext;

	addToPlayList = (event) => {
		event.stopPropagation(); // Prevents click event propagation
		const { songId, name, artist, coverSm, coverBg, src } = this.props;
		const track = {
			id: songId,
			name: name,
			artist: artist,
			src: src,
			coverSm: coverSm,
			coverBg: coverBg,
		};
		this.context.updatePlayList([track, ...this.context.playList]); // Updates the playlist context
	};

	saveThis = () => {
		const { songId, name, artist, coverSm, coverBg, src } = this.props;
		const track = {
			id: songId,
			name: name,
			artist: artist,
			src: src,
			coverSm: coverSm,
			coverBg: coverBg,
		};
		this.context.updateLocalStorage(track);
	};

	deleteThis = () => {
		this.context.removeTrackFromLocalStorage(this.props.songId);
	};

	render() {
		const { songId, name, artist, coverSm, src, option } = this.props;

		return (
			<div className="w-full py-2 px-3 flex items-center gap-3 rounded-md hover:bg-gray-100 transition-colors duration-200">
				<Link to={`/song/${songId}`} className="min-w-0 grow flex items-center gap-3">
					<div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md">
						<img className="w-full h-full object-cover" src={coverSm} alt={`Cover for ${name} by ${artist}`} />
					</div>
					<div className="flex-1 min-w-0">
						<h2 className="text-sm font-medium text-gray-800 truncate">{name}</h2>
						<span className="text-xs text-gray-500 truncate">{artist}</span>
					</div>
				</Link>
				{option === "save" ?
					<button 
						onClick={this.saveThis} 
						className="flex-shrink-0 w-8 h-8 text-white border-b-2 border-r-2 border-yellow-500 hover:border-none rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center"
						aria-label={`Save ${name} to your list`}
					>
						<i className="fas fa-bookmark"></i>
					</button> : option === "delete" ?
					<button 
						onClick={this.deleteThis} 
						className="flex-shrink-0 w-8 h-8 text-white border-b-2 border-r-2 border-red-500 hover:border-none rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center"
						aria-label={`Delete ${name}`}
					>
						<i className="fas fa-times"></i>
					</button> : ''
				}
				<button 
					onClick={this.addToPlayList} 
					className="flex-shrink-0 w-8 h-8 text-white border-b-2 border-r-2 border-blue-500 hover:border-none rounded-full bg-blue-400 hover:bg-blue-500 flex items-center justify-center"
					aria-label={`Add ${name} to your playlist`}
				>
					<i className="fas fa-play pl-0.5"></i>
				</button>
			</div>
		);
	}
}

export default Song;