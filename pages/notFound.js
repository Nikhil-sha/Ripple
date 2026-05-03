class NotFound extends Component {
	getPath = () => {
		const hash = window.location.hash;
		const currentPath = hash.substring(1);
		
		return currentPath;
	}
	
	render() {
		return e("section", { className: "animate-fade-in-up max-w-sm h-full w-full px-3 md:px-8 lg:px-12 pt-4" },
			e("div", { className: "w-full h-full flex flex-col justify-center items-center" },
				e("h1", { className: "text-3xl font-black text-neutral-200 mb-2" }, "Oops!"),
				e("p", { className: "text-sm text-neutral-400" }, `No idea what ${this.getPath()} is about!`)
			)
		)
	}
}

export default NotFound;