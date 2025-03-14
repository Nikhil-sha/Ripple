import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

class Header extends Component {
	static contextType = AppContext;

	navigateBack = () => {
		history.back();
	};

	render() {
		const { handleAsideToggle } = this.context;
		const isHome = this.props.location.pathname === '/';
		console.log('Current Path:', this.props.location.pathname);

		return (
			<header className="w-full flex justify-between items-center bg-neutral-50 border-b border-neutral-200 rounded-b-xl px-3 py-3.5">
				<div>
					{!isHome ?
						<button className="fade_in group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.navigateBack} aria-label="go back">
							<i className="fas fa-chevron-left text-neutral-700 group-hover:text-neutral-100"></i>
						</button>
					:
					<Link to="/">
							<h1 className="fade_in text-xl font-black text-neutral-700 flex items-center">
								<span>Ripple</span>
								<span className="text-yellow-400">.</span>
							</h1>
						</Link>
					}
				</div>

				<nav>
					<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={handleAsideToggle} aria-label="Toggle menu" aria-expanded="false">
						<i className="fas fa-bars text-neutral-700 group-hover:text-neutral-100"></i>
					</button>
				</nav>
			</header>
		);
	}
}

export default withRouter(Header);