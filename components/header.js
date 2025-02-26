import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Header extends Component {
	static contextType = AppContext;

	render() {
		const { handleAsideToggle } = this.context;
		return (
			<header className="w-full flex justify-between items-center bg-neutral-700 rounded-b-xl shadow-md px-3 py-3.5">
				<div>
					<Link to="/">
						<h1 className="text-xl font-black text-neutral-200 flex items-center">
							<span>Ripple</span>
							<span className="text-yellow-400">.</span>
						</h1>
					</Link>
				</div>

				<nav>
					<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-600 hover:bg-yellow-400 transition-all" onClick={handleAsideToggle} aria-label="Toggle menu" aria-expanded="false">
						<i className="fas fa-bars text-neutral-300 group-hover:text-neutral-600"></i>
					</button>
				</nav>
			</header>
		);
	}
}

export default Header;