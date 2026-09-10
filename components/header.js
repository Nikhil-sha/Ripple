import { AppContext } from '../context.js';

import Downloader from './downloader.js';
import Button from './button.js';

class Header extends Component {
	static contextType = AppContext;
	
	state = {
		downloaderMethod: null,
	};
	
	setDownloaderMethod = (fn) => {
		this.setState({
			downloaderMethod: fn
		});
	}
	
	handleAside = () => {
		const menuOptions = [
			{ to: "/", icon: "home", label: "Home" },
			{ to: "/about", icon: "info", label: "About" },
			{ to: "/search", icon: "search", label: "Search" },
			{ to: "/saved", icon: "heart", label: "Saved" },
			{ to: "/settings", icon: "cog", label: "Settings" },
			{ to: "/downloads", icon: "download", label: "Downloads" },
		];
		this.context.setOptions(menuOptions);
	}
	
	navigateBack = () => {
		history.back();
	};
	
	render() {
		const currRoute = this.props.location.pathname.split("/")[1].slice(0, 1).toUpperCase() + this.props.location.pathname.split("/")[1].slice(1);
		
		return (
			e(Fragment, null,
				e("header", { className: "w-full flex justify-between items-center bg-neutral-950 rounded-b-xl border-b border-neutral-900 p-3" },
					e("div", null,
						currRoute !== "" ?
						e("div", { key: currRoute, className: "flex gap-2 items-center" },
							e("button", { className: "animate-fade-in group flex justify-center items-center", onClick: this.navigateBack, "aria-label": "go back" },
								e("i", { className: "fa-solid fa-chevron-left text-yellow-400 group-hover:text-yellow-500 mr-1.5" }),
								e("h1", { className: "text-xl font-bold text-neutral-200" }, currRoute)
							)
						) :
						e(Link, { to: "/" },
							e("h1", { className: "animate-fade-in text-xl font-extrabold text-neutral-200 flex items-center" },
								e("span", null, "Ripple"),
								e("span", { className: "text-yellow-400 ml-0.5" }, "."),
							)
						)
					),
					
					e("nav", { className: "flex gap-2" },
						e(Button, { accent: "yellow", icon: "download", roundness: "full", label: "open downloader", clickHandler: this.state.downloaderMethod }),
						e(Button, { accent: "yellow", icon: "bars", roundness: "full", label: `${this.state.isAsideVisible ? "Close" : "Open"} menu`, clickHandler: this.handleAside }),
					)
				),
				
				e(Downloader, { open: this.setDownloaderMethod })
			)
		);
	}
}

export default withRouter(Header);