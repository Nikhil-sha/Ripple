import React, { Component } from "react";
import { Link } from 'react-router-dom';

class Artist extends Component {
	render() {
		const { artistId, name, image, role } = this.props;

		return (
			<div className="relative w-20 flex-shrink-0 h-20 aspect-square rounded-full overflow-hidden">
				<Link to={`/artist/${artistId}`}>
					<img src={image !== '' ? image : '/Ripple/assets/images/avatar-placeholder.png'} alt={name} className="size-full object-cover" />
					<div className="absolute flex flex-col justify-center items-center top-0 p-2 min-w-0 size-full bg-black/35">
						<p className="block min-w-0 w-full text-center text-xs text-neutral-100 font-bold truncate">{name}</p>
						<span className="block min-w-0 w-full text-center text-xs text-neutral-200 font-light truncate">{role}</span>
					</div>
				</Link>
			</div>
		);
	}
}

export default Artist;