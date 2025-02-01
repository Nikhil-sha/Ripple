import React, { Component } from 'react';
import { AppContext } from '../context';

class Settings extends Component {
	static contextType = AppContext;

	handleQualityChange = (event) => {
		let value = event.target.value;
		this.context.setPreferredQuality(value);
		this.context.addToNotification("success", "Quality preference updated!")
	};

	render() {
		return (
			<section className="h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<h2 className="mb-4 text-2xl font-bold text-gray-800">Settings</h2>
				<div className="max-w-lg mx-auto">
					<div className="w-full mb-4">
						<h3 className="text-sm font-medium text-gray-800 leading-snug mb-1">Audio Quality</h3>
						<div className="relative text-sm w-full">
							<select value={this.context.preferredQuality} onChange={this.handleQualityChange} className="block w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition">
								<option value="12kbps">12 Kbps (low)</option>
								<option value="48kbps">48 Kbps</option>
								<option value="96kbps">96 Kbps (mid)</option>
								<option value="160kbps">160 Kbps (preferred)</option>
								<option value="320kbps">320 Kbps (high)</option>
							</select>
							<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
								<i className="fa-solid fa-chevron-down text-gray-500"></i>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default Settings;