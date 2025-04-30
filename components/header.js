import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

import Aside from './aside';

class Header extends Component {
	static contextType = AppContext;

	state = {
		isAsideVisible: false,
	};

	handleAsideToggle = () => {
		this.setState((prevState) => ({
			isAsideVisible: !prevState.isAsideVisible,
		}));
	};

	navigateBack = () => {
		history.back();
	};

	render() {
		const currRoute = this.props.location.pathname.split("/")[1].slice(0, 1).toUpperCase() + this.props.location.pathname.split("/")[1].slice(1);

		return (
			<header className="w-full flex justify-between items-center bg-neutral-50 rounded-b-xl border-b border-neutral-200 px-3 py-3">
				<div>
					{currRoute !== "" ?
						<div className="flex gap-2 items-center">
							<button className="animate-fade-in group flex justify-center items-center" onClick={this.navigateBack} aria-label="go back">
								<i class="fa-solid fa-chevron-left text-yellow-400 group-hover:text-yellow-400 mr-1.5"></i>
								<h1 className="animate-fade-in text-xl font-bold text-neutral-700">
									{currRoute}
								</h1>
							</button>
						</div>
					:
					<Link to="/">
							<h1 className="font-[Pacifico] animate-fade-in text-xl font-extrabold text-neutral-700 flex items-center">
								<span>Ripple</span>
								<span className="text-yellow-400 ml-0.5">.</span>
							</h1>
						</Link>
					}
				</div>

				<nav className="relative">
					<button className="group size-8 flex justify-center items-center rounded-full bg-neutral-100 hover:bg-yellow-400 transition-all" onClick={this.handleAsideToggle} aria-label={`${this.state.isAsideVisible ? "Close" : "Open"} menu`} aria-expanded="false">
						{ this.state.isAsideVisible ? 
							<i class="fa-solid fa-times animate-fade-in text-neutral-700 group-hover:text-neutral-100"></i> : 
							<span class="fa-solid fa-bars animate-fade-in text-neutral-700 group-hover:text-neutral-100"></span>
						}
					</button>
					<Aside visible={this.state.isAsideVisible}/>
				</nav>
			</header>
		);
	}
}

export default withRouter(Header);