import React, { Component } from 'react';

class ErrorCard extends Component {
	render() {
		const { errorContext } = this.props;

		return (
			<div className="fade_in w-full max-w-md mx-auto p-4 flex items-center justify-center gap-3 text-red-600 text-sm md:text-base bg-red-50 rounded-md font-medium mt-4">
				<i className="fas fa-exclamation-triangle"></i>
				<h2>{errorContext || "Oops! Something went wrong. Try again later."}</h2>
			</div>
		);
	}
}

export default ErrorCard;