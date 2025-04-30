import React, { Component } from 'react';

class ErrorCard extends Component {
	render() {
		const { errorContext } = this.props;

		return (
			<div className="animate-fade-in w-full max-w-md mx-auto p-4 flex items-center justify-center gap-3 text-red-600 text-sm md:text-base bg-red-50 rounded-md font-medium mt-4">
				<i className="fa-solid fa-exclamation-circle"></i>
				<h2>{errorContext || "Oops! Something went wrong. Try again later."}</h2>
			</div>
		);
	}
}

export default ErrorCard;