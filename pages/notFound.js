import React, { Component, Fragment } from 'react';

class NotFound extends Component {
	getPath = () => {
		const hash = window.location.hash;
		const currentPath = hash.substring(1);

		return currentPath;
	}

	render() {
		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<div className="w-full max-w-sm h-full max-h-sm flex flex-col justify-center items-center">
					<img className="w-3/4 rounded-lg" src="https://error404.fun/img/illustrations/19@2x.png" />
					<h1 className="text-3xl font-black text-neutral-800">404</h1>
					<p className="text-sm font-semibold text-neutral-600">I have no idea what {this.getPath()} is about!</p>
				</div>
			</section>
		)
	}
}

export default NotFound;