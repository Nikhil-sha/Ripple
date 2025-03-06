import React, { Component } from 'react';
import { AppContext } from '../context';

class Popup extends Component {
	static contextType = AppContext;

	getThemeClasses = () => {
		if (!this.context.notifications.length) return 'hidden'; // Hide if no notifications

		const { type } = this.context.notifications[0];
		switch (type) {
			case 'success':
				return 'border-green-400 bg-green-200/30 text-green-700';
			case 'error':
				return 'border-red-400 bg-red-200/30 text-red-700';
			default:
				return 'border-yellow-400 bg-yellow-200/30 text-yellow-700';
		}
	};

	render() {
		if (!this.context.notifications.length) return null; // Prevent rendering if empty

		const themeClasses = this.getThemeClasses();
		const notificationText = this.context.notifications[0].text || 'No new notifications';

		return (
			<div
				className={`fade_in fixed top-4 left-4 z-50 flex items-center gap-2 w-fit max-w-sm px-4 py-2 border-l-4 rounded-xl shadow-lg backdrop-blur-md transition-opacity duration-300 ${themeClasses}`}
				role="alert"
				aria-live="polite"
				aria-label={`Notification: ${notificationText}`}
			>
				<i className="fas fa-info-circle text-lg" aria-hidden="true"></i>
				<p className="text-sm font-medium">{notificationText}</p>
			</div>
		);
	}
}

export default Popup;