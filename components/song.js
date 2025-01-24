import React, { Component } from "react";
import { Link } from 'react-router-dom';

class Song extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { songId, name, artist, cover } = this.props;

		return (
			<div className="w-full py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
				<Link to={`/song/${songId}`} className="flex items-center gap-3">
					<div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md">
						<img className="w-full h-full object-cover" src={cover} alt={name} />
					</div>
					<div className="flex-1 min-w-0">
						<h2 className="text-sm font-medium text-gray-800 truncate">{name}</h2>
						<span className="text-xs text-gray-500 truncate">{artist}</span>
					</div>
				</Link>
			</div>
		);
	}
}

export default Song;