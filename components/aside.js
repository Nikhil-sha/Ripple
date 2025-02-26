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
			{ to: "/notifications", icon: "fa-bell", label: "Notifications" },
			{ to: "/saved", icon: "fa-bookmark", label: "Saved" },
			{ to: "/settings", icon: "fa-cog", label: "Settings" },
		];

		return (
			<aside className={`fixed flex top-0 right-0 z-50 w-full h-full bg-black/25 transition-transform transform ${isAsideVisible ? "translate-x-0" : "translate-x-full"}`} role="menu" aria-hidden={!isAsideVisible}>
				<div className="grow h-full" onClick={handleAsideToggle}>
				</div>
				<div className="w-64 md:w-1/4 rounded-l-xl bg-neutral-700 flex-col h-dvh p-4">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-bold text-neutral-200">Menu</h2>
						<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-600 hover:bg-yellow-400 transition-all" onClick={handleAsideToggle} aria-label="Close menu" aria-expanded={isAsideVisible}>
							<i className="fas fa-times text-neutral-300 group-hover:text-neutral-600"></i>
						</button>
					</div>
					<hr className="border-neutral-600/50 mb-4" />

					<nav className="flex-grow overflow-auto">
						<ul className="space-y-3">
							<li className="text-xs font-semibold text-neutral-300">PAGES</li>
							{links.map((link, index) => (
								<li key={index} role="menuitem">
									<Link className="flex items-center text-sm p-3 hover:bg-neutral-600 rounded-lg transition duration-500" to={link.to}>
										<i className={`fas ${link.icon} text-neutral-400 mr-3 w-5 text-center`}></i>
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