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
			{ to: "/notifications", icon: "fa-bell", label: "Notifications" },
			{ to: "/saved", icon: "fa-bookmark", label: "Saved" },
			{ to: "/settings", icon: "fa-cog", label: "Settings" },
		];

		return (
			<aside className={`fixed top-0 right-0 z-40 max-w-md max-h-full w-full rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col px-4 transition-all duration-300 transform ${isAsideVisible ? "translate-y-0" : "-translate-y-full"}`} role="menu" aria-hidden={!isAsideVisible}>
				<div className="flex justify-between items-center my-4">
					<h2 className="text-lg font-bold text-neutral-800">Menu</h2>
					<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={handleAsideToggle} aria-label="Close menu" aria-expanded={isAsideVisible}>
						<i className="fas fa-times text-neutral-700 group-hover:text-neutral-100"></i>
					</button>
				</div>
					
				<hr className="border-neutral-200/50" />

				<nav className="w-full py-4 grow overflow-y-auto">
					<ul className="space-y-3 h-fit w-full">
						<li className="text-xs font-semibold text-neutral-600">PAGES</li>
						{links.map((link, index) => (
							<li key={index} role="menuitem">
								<Link className="flex items-center text-sm p-3 hover:bg-neutral-200/50 rounded-lg transition duration-500" to={link.to}>
									<i className={`fas ${link.icon} text-neutral-400 mr-3 w-5 text-center`}></i>
									{link.label}
								</Link>
							</li>
						))}
						<li role="menuitem">
							<button className="w-full flex items-center text-sm p-3 hover:bg-neutral-200/50 rounded-lg transition duration-500" aria-label="reload app" onClick={this.reloadApp}>
								<i className="fas fa-rotate-right text-neutral-400 mr-3 w-5 text-center"></i>
								Refresh
							</button>
						</li>
					</ul>
				</nav>
			</aside>
		);
	}
}

export default Aside;