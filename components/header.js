import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { AppContext } from '../context';

import Aside from './aside';
import Downloader from './downloader';
import Button from './button';

class Header extends Component {
	static contextType = AppContext;
	
	state = {
		isDownloaderVisible: false,
		downloaderButtonDisabled: false,
		willDownloaderUnmount: false,
		isAsideVisible: false,
		asideButtonDisabled: false,
		willAsideUnmount: false
	};
	
	unmountTimeout = {
		downloader: null,
		aside: null
	};
	
	handleAsideToggle = () => {
		if (this.unmountTimeout.aside) {
			clearTimeout(this.unmountTimeout.aside);
		}
		
		if (this.state.isAsideVisible) {
			this.setState({
				willAsideUnmount: true,
				asideButtonDisabled: true
			});
			this.unmountTimeout.aside = setTimeout(() => this.setState({
				isAsideVisible: false,
				asideButtonDisabled: false
			}), 300);
		} else {
			this.setState((prevState) => ({
				willAsideUnmount: false,
				isAsideVisible: true,
			}));
		}
	};
	
	handleDownloaderToggle = () => {
		if (this.unmountTimeout.downloader) {
			clearTimeout(this.unmountTimeout.downloader);
		}
		
		if (this.state.isDownloaderVisible) {
			this.setState({
				willDownloaderUnmount: true,
				downloaderButtonDisabled: true
			});
			this.unmountTimeout.downloader = setTimeout(() => this.setState({
				isDownloaderVisible: false,
				downloaderButtonDisabled: false
			}), 300);
		} else {
			this.setState((prevState) => ({
				willDownloaderUnmount: false,
				isDownloaderVisible: true,
			}));
		}
	};
	
	navigateBack = () => {
		history.back();
	};
	
	render() {
		const currRoute = this.props.location.pathname.split("/")[1].slice(0, 1).toUpperCase() + this.props.location.pathname.split("/")[1].slice(1);
		
		return (
			<header className="w-full flex justify-between items-center bg-neutral-950 rounded-b-xl border-b border-neutral-900 px-3 py-2">
				<div>
					{currRoute !== "" ?
						<div className="flex gap-2 items-center">
							<button className="animate-fade-in group flex justify-center items-center" onClick={this.navigateBack} aria-label="go back">
								<i className="fa-solid fa-chevron-left text-yellow-400 group-hover:text-yellow-500 mr-1.5"></i>
								<h1 className="animate-fade-in text-xl font-bold text-neutral-200">
									{currRoute}
								</h1>
							</button>
						</div>
					:
					<Link to="/">
						<h1 className="animate-fade-in text-xl font-extrabold text-neutral-200 flex items-center">
							<span>Ripple</span>
							<span className="text-yellow-400 ml-0.5">.</span>
						</h1>
					</Link>
					}
				</div>

				<nav className="flex gap-2">
					<div className="relative">
						<Button accent="yellow" icon={this.state.isDownloaderVisible ? "times" : "download"} roundness="full" label={`${this.state.isDownloaderVisible ? "Close" : "Open"} downloader`} clickHandler={this.handleDownloaderToggle} disabled={this.state.downloaderButtonDisabled} />
						<Downloader isVisible={this.state.isDownloaderVisible} willUnmount={this.state.willDownloaderUnmount} />
					</div>
					
					<div className="relative">
						<Button accent="yellow" icon={this.state.isAsideVisible ? "times" : "bars"} roundness="full" label={`${this.state.isAsideVisible ? "Close" : "Open"} menu`} clickHandler={this.handleAsideToggle} disabled={this.state.asideButtonDisabled} />
						{this.state.isAsideVisible && <Aside willUnmount={this.state.willAsideUnmount} />}
					</div>
				</nav>
			</header>
		);
	}
}

export default withRouter(Header);