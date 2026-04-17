import React, { Component, Fragment } from 'react';

class NotFound extends Component {
	getPath = () => {
		const hash = window.location.hash;
		const currentPath = hash.substring(1);

		return currentPath;
	}

	render() {
		return (
			<section className="animate-fade-in-up max-w-sm h-full w-full px-3 md:px-8 lg:px-12 pt-4">
				<div className="w-full h-full flex flex-col justify-center items-center">
					<h1 className="text-3xl font-black text-neutral-800">Oops!</h1>
					<p className="text-sm font-semibold text-neutral-600">No idea what {this.getPath()} is about!</p>
				</div>
			</section>
		)
	}
}

export default NotFound;	