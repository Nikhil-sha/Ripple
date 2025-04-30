import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Aside extends Component {
	reloadApp = () => {
		window.location.reload();
	};

	render() {
		const { visible } = this.props;
		const links = [
			{ to: "/", icon: "home", label: "Home" },
			{ to: "/about", icon: "info", label: "About" },
			{ to: "/search", icon: "search", label: "Search" },
			{ to: "/saved", icon: "bookmark", label: "Saved" },
			{ to: "/settings", icon: "cog", label: "Settings" },
		];

		return (
			<aside className={`${visible ? "animate-fade-in" : "hidden"} absolute top-full right-0 z-40 w-64 h-max bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col shadow-lg`} role="menu" aria-hidden={!visible}>
				<div className="flex px-4 justify-between items-center my-4">
					<h2 className="text-lg font-bold text-neutral-800">Menu</h2>
					<div className="flex gap-2 items-center">
						<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.reloadApp} aria-label="Restart App">
							<i className="fa-solid fa-rotate-right text-neutral-700 group-hover:text-neutral-100 group-hover:rotate-180 transition-transform duration-500"></i>
						</button>
					</div>
				</div>
					
				<hr className="border-neutral-200/50" />

				<nav className="w-full py-4 min-h-0 grow overflow-y-auto">
					<ul className="space-y-1 h-fit w-full">
						<li className="px-4 text-xs font-semibold text-neutral-600">PAGES</li>
						{links.map((link, index) => (
							<li key={index} role="menuitem">
								<Link className="flex items-center text-sm px-5 py-3 hover:bg-neutral-200/50 transition duration-500" to={link.to}>
									<i className={`fa-solid fa-${link.icon} text-neutral-400 mr-3 w-5 text-center`}></i>
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