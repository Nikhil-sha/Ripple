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
		console.error("Error Boundary Caught an Error:", error, errorInfo);
		this.setState({ errorInfo });
	}

	handleReload = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			// Fallback UI
			return (
				<div className="h-full w-full max-w-sm mx-auto p-8 flex flex-col justify-center items-center">
    	<h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
   	 <p className="text-xs text-center text-gray-400 mb-4">
    	 {this.state.error.toString() || "An unexpected error occurred."}
    	</p>
    	<p className="text-sm text-gray-500 mb-6">
      Error occurred at: {new Date().toLocaleString()}
    	</p>
    	<button
      onClick={this.handleReload}
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
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