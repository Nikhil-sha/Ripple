import React, { Component, Fragment } from 'react';
import { AppContext } from '../context';

class Notifications extends Component {
	static contextType = AppContext;

	render() {
		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<h2 className="mb-4 text-2xl font-bold text-neutral-800">Notifications</h2>
				<ul className="max-w-md mx-auto flex flex-col gap-2">
					{this.context.notifications.map((notification, index) => (
						<li key={index} className="w-full p-3 flex flex-col text-sm text-neutral-600 rounded-lg bg-neutral-100 hover:shadow-md transition duration-500">
							<p>{notification.text}</p>
							<i className="font-semibold border-t border-neutral-200 pt-1 mt-1">{notification.type}</i>
							<span className="text-xs text-neutral-400 font-bold self-end">at {notification.time}</span>
						</li>
					))}
				</ul>
			</section>
		)
	}
}

export default Notifications;