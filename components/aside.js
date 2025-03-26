import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context';

class Aside extends Component {
	static contextType = AppContext;

	reloadApp = () => {
		window.location.reload();
	};

	render() {
		const { isAsideVisible, handleAsideToggle } = this.context;
		const links = [
			{ to: "/", icon: "fa-home", label: "Home" },
			{ to: "/about", icon: "fa-info-circle", label: "About" },
			{ to: "/search", icon: "fa-search", label: "Search" },
			{ to: "/saved", icon: "fa-bookmark", label: "Saved" },
			{ to: "/settings", icon: "fa-cog", label: "Settings" },
		];

		return (
			<aside className={`fixed top-0 right-0 z-40 max-w-md max-h-full w-full bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col transition-all duration-300 transform ${isAsideVisible ? "translate-y-0" : "-translate-y-full"} ease-linear`} role="menu" aria-hidden={!isAsideVisible}>
				<div className="flex px-4 justify-between items-center my-4">
					<h2 className="text-lg font-bold text-neutral-800">Menu</h2>
					<div className="flex gap-2 items-center">
						<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.reloadApp} aria-label="Close menu" aria-expanded={isAsideVisible}>
							<i className="fas fa-rotate-right text-neutral-700 group-hover:text-neutral-100"></i>
						</button>
						<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={handleAsideToggle} aria-label="Close menu" aria-expanded={isAsideVisible}>
							<i className="fas fa-times text-neutral-700 group-hover:text-neutral-100"></i>
						</button>
					</div>
				</div>
					
				<hr className="border-neutral-200/50" />

				<nav className="w-full py-4 grow overflow-y-auto">
					<ul className="space-y-1 h-fit w-full">
						<li className="px-4 text-xs font-semibold text-neutral-600">PAGES</li>
						{links.map((link, index) => (
							<li key={index} role="menuitem">
								<Link className="flex items-center text-sm px-5 py-3 hover:bg-neutral-200/50 transition duration-500" to={link.to}>
									<i className={`fas ${link.icon} text-neutral-400 mr-3 w-5 text-center`}></i>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</aside>
		);
	}
}

export default Aside;