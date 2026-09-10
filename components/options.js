import { AppContext } from "../context.js";
import Button from './button.js';

class Options extends Component {
	static contextType = AppContext;
	
	hideTimeout = null;
	onPopState = null;
	
	state = {
		options: [],
		isVisible: false,
		isHiding: false
	};
	
	componentDidMount() {
		this.context.setOptionsMethod(this.handleOptions);
	}
	
	componentWillUnmount() {
		if (this.hideTimeout) clearTimeout(this.hideTimeout);
		this.removePopState();
	}
	
	removePopState = () => {
		if (this.onPopState) {
			window.removeEventListener("popstate", this.onPopState);
			this.onPopState = null;
		}
	};
	
	handleToggle = (isBackNavigation = false) => {
		if (this.hideTimeout) clearTimeout(this.hideTimeout);
		
		if (this.state.isVisible) {
			this.setState({ isHiding: true });
			
			this.hideTimeout = setTimeout(() => {
				this.removePopState();
				
				if (!isBackNavigation && window.history.state?.options) {
					window.history.back();
				}
				
				this.setState({
					isVisible: false,
					isHiding: false,
				});
			}, 250);
		} else {
			window.history.pushState({ options: true }, "Options", window.location.href);
			
			this.onPopState = () => this.handleToggle(true);
			window.addEventListener("popstate", this.onPopState, { once: true });
			
			this.setState({
				isHiding: false,
				isVisible: true,
			});
		}
	};
	
	handleOptions = (options) => {
		this.setState({ options }, () => this.handleToggle());
	};
	
	handleHide = (e) => {
		if (e.target !== e.currentTarget) return;
		this.handleToggle();
	};
	
	render() {
		if (!this.state.options.length) return null;
		
		return e("section", {
				onClick: this.handleHide,
				className: `${this.state.isHiding ? "pointer-events-none " : ""}${this.state.isVisible ? "absolute inset-0 z-50 " : "hidden "}flex flex-col items-center justify-end bg-black/50 backdrop-blur-sm p-4`
			},
			e('div', {
					onClick: () => this.handleToggle(),
					className: `${this.state.isHiding ? "animate-leave-down" : "animate-enter-up"} max-h-fit max-w-96 w-full h-full p-2 shadow-lg shadow-neutral-900/80 bg-neutral-800 rounded-3xl border border-neutral-700 flex flex-col divide-y divide-neutral-700/30 overflow-hidden`
				},
				this.state.options.map((opt, i) => (
					opt.isButton ?
					e('button', { key: i, onClick: opt.handler, className: "group w-full inline-flex items-center p-3 active:bg-neutral-700/25 first:rounded-t-2xl last:rounded-b-2xl transition" },
						e('i', { className: `w-5 mr-3 text-center fa-solid fa-${opt.icon} fa-sm text-neutral-400 group-hover:text-yellow-400 transition` }),
						e('span', { className: "text-sm font-medium text-neutral-200" }, opt.label)
					) :
					e(Link, { key: i, to: opt.to, className: "group w-full inline-flex items-center p-3 active:bg-neutral-700/25 first:rounded-t-2xl last:rounded-b-2xl transition" },
						e('i', { className: `w-5 mr-3 text-center fa-solid fa-${opt.icon} fa-sm text-neutral-400 group-hover:text-yellow-400 transition` }),
						e('span', { className: "text-sm font-medium text-neutral-200" }, opt.label)
					)
				))
			)
		);
	}
}

export default Options;