import React, { Component, Fragment } from 'react';

class NotFound extends Component {
	getPath = () => {
		const hash = window.location.hash;
		const currentPath = hash.substring(1);

		return currentPath;
	}

	render() {
		return (
			<section className="animate-fade-in-up min-h-0 w-full px-4 md:px-8 lg:px-12 pt-4">
				<div className="w-full max-w-sm h-full max-h-sm flex flex-col justify-center items-center">
					<h1 className="text-3xl font-black text-neutral-800">Oops!</h1>
					<p className="text-sm font-semibold text-neutral-600">No idea what {this.getPath()} is about!</p>
				</div>
			</section>
		)
	}
}

export default NotFound;