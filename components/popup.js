import React, { Component } from 'react';
import { AppContext } from '../context';

class Popup extends Component {
	static contextType = AppContext;

	theme = () => {
		const { type } = this.context.notifications[0];
		if (type === 'success') {
			return 'border-green-400';
		} else if (type === 'error') {
			return 'border-red-400';
		} else {
			return 'border-yellow-400';
		}
	};

	render() {
		const themeClasses = this.theme();
		const notificationText = this.context.notifications[0].text || 'No new notifications';

		return (
			<div
				className={`flex bg-neutral-700 gap-2 items-center absolute top-4 left-4 mr-4 z-50 w-fit max-w-sm px-4 py-2 border-2 rounded-xl ${themeClasses}`}
				aria-live="polite"
				aria-label={`Notification: ${notificationText}`}
			>
				<i className="fas fa-info-circle text-neutral-400" aria-hidden="true"></i>
				<p className="text-sm font-semibold text-neutral-100">{notificationText}</p>
			</div>
		);
	}
}

export default Popup;