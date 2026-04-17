import React, { Component } from "react";
import { Link } from 'react-router-dom';

class Artist extends Component {
	render() {
		const { artistId, name, image, role } = this.props;

		return (
			<div className="w-20 flex-shrink-0 flex flex-col items-center">
				<Link to={`/artist/${artistId}`} className="contents">
					<img src={image !== '' ? image : '../assets/images/avatar-placeholder.png'} alt={name} className="w-full aspect-square rounded-full mb-2" />
					<p className="block min-w-0 w-full text-center text-xs font-normal text-neutral-200 truncate">{name}</p>
					<span className="block min-w-0 w-full text-center text-xs text-neutral-400 truncate">{role}</span>
				</Link>
			</div>
		);
	}
}

export default Artist;