import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Aside extends Component {
	static contextType = AppContext;

	render() {
		const { isAsideVisible, handleAsideToggle } = this.context;
		const links = [
			{ to: "/", icon: "fa-home", label: "Home" },
			{ to: "/about", icon: "fa-info-circle", label: "About" },
			{ to: "/search", icon: "fa-search", label: "Search" },
			{ to: "/saved", icon: "fa-bookmark", label: "Saved" },
		];

		return (
			<aside className={`fixed top-0 right-0 z-50 w-64 md:w-1/4 h-screen bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl rounded-l-xl transition-transform transform ${isAsideVisible ? "translate-x-0" : "translate-x-full"}`} role="menu" aria-hidden={!isAsideVisible}>
				<div className="flex flex-col h-full p-4">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-bold text-gray-700">Menu</h2>
						<button className="p-2 rounded-full hover:bg-gray-200" onClick={handleAsideToggle} aria-label="Close menu" aria-expanded={isAsideVisible}>
							<i className="fas fa-times text-gray-500"></i>
						</button>
					</div>
					<hr className="border-gray-300 mb-4" />

					<nav className="flex-grow overflow-auto">
						<ul className="space-y-3">
							<li className="text-xs font-semibold text-gray-500">PAGES</li>
							{links.map((link, index) => (
								<li key={index} role="menuitem">
									<Link className="flex items-center text-sm p-3 hover:bg-gray-200 rounded-lg" to={link.to}>
										<i className={`fas ${link.icon} text-gray-500 mr-3 w-5 text-center`}></i>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</aside>
		);
	}
}

export default Aside;