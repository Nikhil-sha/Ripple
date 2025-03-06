import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';

class Settings extends Component {
	static contextType = AppContext;

	handleQualityChange = (event) => {
		let value = event.target.value;
		this.context.setPreferredQuality(value);
		this.context.addToNotification("success", "Quality preference updated!")
	};

	handleLimitChange = (event) => {
		let value = event.target.value;
		this.context.setSearchLimit(value);
		this.context.addToNotification("success", "Search results limit updated!")
	};

	render() {
		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<h2 className="mb-4 text-2xl font-bold text-neutral-800">Settings</h2>
				<div className="max-w-lg mx-auto">
					<div className="w-full flex justify-between items-center gap-4 mb-4">
						<h3 className="text-sm font-medium text-neutral-700 leading-snug mb-1">Audio Quality</h3>
						<div className="relative text-sm w-1/2">
							<select value={this.context.preferredQuality} onChange={this.handleQualityChange} className="block appearance-none px-3 py-2 w-full rounded-md bg-neutral-200/50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">
								<option value="12kbps">12 Kbps (low)</option>
								<option value="48kbps">48 Kbps</option>
								<option value="96kbps">96 Kbps (mid)</option>
								<option value="160kbps">160 Kbps (preferred)</option>
								<option value="320kbps">320 Kbps (high)</option>
							</select>
							<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
								<i className="fa-solid fa-chevron-down text-neutral-400"></i>
							</div>
						</div>
					</div>
					<div className="w-full flex justify-between items-center gap-4 mb-4">
						<h3 className="text-sm font-medium text-neutral-700 leading-snug mb-1">Search results limit</h3>
						<div className="relative text-sm w-1/2">
							<select value={this.context.searchResultsLimit} onChange={this.handleLimitChange} className="block appearance-none px-3 py-2 w-full rounded-md bg-neutral-200/50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="15">15 (preferred)</option>
								<option value="20">20</option>
								<option value="30">30 (max)</option>
							</select>
							<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
								<i className="fa-solid fa-chevron-down text-neutral-400"></i>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default Settings;