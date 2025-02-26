import React, { Component, Fragment } from 'react';

class NotFound extends Component {
	getPath = () => {
		const hash = window.location.hash;
		const currentPath = hash.substring(1);

		return currentPath;
	}

	render() {
		return (
			<Fragment>
				<div className="w-full max-w-sm h-full max-h-sm flex flex-col justify-center items-center">
					<img className="w-3/4 rounded-lg" src="https://error404.fun/img/illustrations/19@2x.png" />
					<h1 className="text-3xl font-black text-neutral-100">404</h1>
					<p className="text-sm font-semibold text-neutral-400">I have no idea what {this.getPath()} is about!</p>
				</div>
			</Fragment>
		)
	}
}

export default NotFound;