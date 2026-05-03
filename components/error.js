class ErrorCard extends Component {
	render() {
		const { errorContext } = this.props;
		
		return e("div", { className: "animate-fade-in w-full max-w-md mx-auto p-4 flex items-center justify-center gap-3 text-neutral-800 text-sm md:text-base bg-red-400 rounded-md font-medium" },
			e("i", { className: "fa-solid fa-exclamation-circle" }),
			e("h2", null, errorContext || "Oops! Something went wrong. Try again later.")
		)
	}
}

export default ErrorCard;