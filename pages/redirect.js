class Redirect extends Component {
	goToURL = () => {
		const { url } = this.props.match.params;
		window.open(decodeURIComponent(url), "_blank", 'width=600,height=400');
		history.back();
	}
	
	componentDidMount(){
		this.goToURL();
	};
	
	render() {
		return e("section", { className: "animate-fade-in-up max-w-sm h-full w-full px-3 md:px-8 lg:px-12 pt-4" },
			e("div", { className: "w-full h-full flex flex-col justify-center items-center font-medium text-neutral-100" }, 'Redirecting...')
		)
	}
}

export default Redirect;