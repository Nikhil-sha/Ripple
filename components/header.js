import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
	render() {
		const { onAsideToggle } = this.props;
		return (
			<header className="w-full sticky top-0 z-40 flex flex-row justify-between items-center rounded-b-xl shadow-md p-3">
				<div>
					<Link to="/">
					<h1 className="text-xl font-black text-gray-900 flex">
						<span>Ripple</span>
						<span className="text-yellow-500">.</span>
					</h1>
					</Link>
				</div>
				<nav>
					<button className="p-1" onClick={onAsideToggle} aria-label="Toggle menu">
						<i className="fas fa-bars fa-md"></i>
					</button>
				</nav>
			</header>
		);
	}
}

export default Header;