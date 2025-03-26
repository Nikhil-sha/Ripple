import React, { Component } from "react";

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Update state to render fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		// Log the error to an error reporting service (or console)
		this.setState({ errorInfo });
	}

	handleReload = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			// Fallback UI
			return (
				<div className="h-full w-full max-w-sm mx-auto p-8 flex flex-col justify-center items-center">
    	<h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
   	 <p className="text-sm text-center text-neutral-600 mb-4">
    	 {this.state.error.toString() || "An unexpected error occurred."}
    	</p>
    	<p className="text-sm text-neutral-400 mb-6">
      Error occurred at: {new Date().toLocaleString()}
    	</p>
    	<button
      onClick={this.handleReload}
      className="mt-4 bg-yellow-400 text-neutral-600 px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 hover:text-yellow-400 transition"
    	>
      Reload App
    	</button>
  		</div>
			);

		}

		// Render children if no error occurred
		return this.props.children;
	}
}


export default ErrorBoundary;