import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Aside extends Component {
	render() {
		const { isVisible, onAsideToggle } = this.props;
		const links = [
			{ to: "/", icon: "fa-home", label: "Home" },
			{ to: "/about", icon: "fa-info-circle", label: "About" },
			{ to: "/search", icon: "fa-search", label: "Search" },
			{ to: "/saved", icon: "fa-bookmark", label: "Saved" },
		];

		return (
			<aside className={`${isVisible ? 'block' : 'hidden' } absolute top-0 right-0 z-50 w-64 md:w-2/5 h-dvh bg-white rounded-l-xl shadow-xl transition-transform transform ${isVisible ? 'translate-x-0' : 'translate-x-full' }`}>
				<div className="w-full h-full flex flex-col p-4">
					<div className="inline-flex justify-between items-center">
						<h2 className="text-md font-bold">Menu</h2>
						<button className="p-1" onClick={onAsideToggle} aria-label="Close menu">
							<i className="fas fa-times fa-md"></i>
						</button>
					</div>
					<hr className="mt-1 mb-2" />
					<nav className="w-full grow min-h-0 overflow-auto">
						<ul className="flex flex-col gap-1">
							<li className="font-bold text-xs text-gray-400 my-1">PAGES</li>
							{links.map((link, index) => (
							<li key={index} className="w-full">
								<Link className="block text-sm p-2 hover:bg-gray-200 rounded-lg" to={link.to}>
								<i className={`fas ${link.icon} fa-md w-6 mr-2 text-gray-400 text-center`}></i>
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