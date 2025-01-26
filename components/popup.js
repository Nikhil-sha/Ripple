import React, { Component } from 'react';
import { AppContext } from '../context';

class Popup extends Component {
	static contextType = AppContext;

	theme = () => {
		const { type } = this.context.notifications[0];
		if (type === 'success') {
			return 'bg-green-400 border-green-500';
		} else if (type === 'error') {
			return 'bg-red-400 border-red-500';
		} else {
			return 'bg-yellow-400 border-yellow-500';
		}
	};

	render() {
		const themeClasses = this.theme();
		const notificationText = this.context.notifications[0].text || 'No new notifications';

		return (
			<div
				className={`flex gap-2 items-center absolute top-4 left-4 mr-4 z-50 w-fit max-w-sm px-4 py-2 border-b-2 border-r-2 rounded-xl ${themeClasses}`}
				aria-live="polite"
				aria-label={`Notification: ${notificationText}`}
			>
				<i className="fas fa-bell text-white" aria-hidden="true"></i>
				<p className="text-sm font-semibold text-white">{notificationText}</p>
			</div>
		);
	}
}

export default Popup;