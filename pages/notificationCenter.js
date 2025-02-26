import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';

class Notifications extends Component {
	static contextType = AppContext;

	render() {
		return (
			<Fragment>
				<h2 className="mb-4 text-2xl font-bold text-neutral-300">Notifications</h2>
				<ul className="max-w-md mx-auto flex flex-col gap-2">
					{this.context.notifications.map((notification, index) => (
						<li key={index} className="w-full p-3 flex flex-col text-sm text-neutral-200 rounded-lg border border-neutral-700/50 hover:bg-neutral-700/50 transition duration-500">
							<p>{notification.text}</p>
							<i className="font-semibold border-t border-neutral-700 pt-1 mt-1">{notification.type}</i>
							<span className="text-xs text-neutral-400 font-bold self-end">at {notification.time}</span>
						</li>
					))}
				</ul>
			</Fragment>
		)
	}
}

export default Notifications;