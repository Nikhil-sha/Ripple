import React, { Component } from 'react';
import { AppContext } from '../context';

class Notifications extends Component {
	static contextType = AppContext;

	render() {
		return (
			<section className="h-full overflow-y-auto p-4 pb-20">
				<ul className="flex flex-col gap-2">
					{this.context.notifications.map((notification, index) => (
						<li key={index} className="w-full p-3 flex flex-col text-sm text-gray-600 rounded-lg shadow-md hover:bg-gray-100">
							<p>{notification.text}</p>
							<i className="font-semibold border-t border-gray-100 pt-1 mt-1">{notification.type}</i>
							<span className="text-xs text-gray-400 font-bold self-end">at {notification.time}</span>
						</li>
					))}
				</ul>
			</section>
		)
	}
}

export default Notifications;