import React, { Component } from "react";
import { Link } from 'react-router-dom';

class Album extends Component {
	render() {
		const { albumId, name, cover } = this.props;

		return (
			<div className="w-24 flex flex-col justify-center gap-2 flex-shrink-0">
				<Link to={`/album/${albumId}`} class="contents">
					<img src={cover} alt={`cover for ${name}`} className="w-full rounded-2xl aspect-square" />
					<span className="block min-w-0 w-full text-center text-sm font-normal text-neutral-200 truncate">{name}</span>
				</Link>
			</div>
		);
	}
}

export default Album;