import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Header extends Component {
	static contextType = AppContext;

	render() {
		const { handleAsideToggle } = this.context;
		return (
			<header className="w-full sticky top-0 z-40 flex justify-between items-center bg-gradient-to-r from-blue-100 to-white rounded-b-xl shadow-md px-3 py-2">
				<div>
					<Link to="/">
						<h1 className="text-xl font-black text-gray-900 flex items-center">
							<span>Ripple</span>
							<span className="text-yellow-500">.</span>
						</h1>
					</Link>
				</div>

				<nav>
					<button className="p-2 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-blue-400 transition-all" onClick={handleAsideToggle} aria-label="Toggle menu" aria-expanded="false">
						<i className="fas fa-bars text-gray-700 text-lg"></i>
					</button>
				</nav>
			</header>
		);
	}
}

export default Header;