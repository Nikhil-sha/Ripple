import { AppContext } from '../context.js';

class Settings extends Component {
	static contextType = AppContext;
	
	static options = {
		preferredQuality: [
		{
			label: "12 Kbps",
			value: "12kbps"
		},
		{
			label: "48 Kbps",
			value: "48kbps"
		},
		{
			label: "96 Kbps",
			value: "96kbps"
		},
		{
			label: "160 Kbps",
			value: "160kbps"
		},
		{
			label: "320 Kbps",
			value: "320kbps"
		}],
		searchResultsLimit: [
		{
			label: "05 Songs",
			value: "5"
		},
		{
			label: "10 Songs",
			value: "10"
		},
		{
			label: "20 Songs",
			value: "20"
		},
		{
			label: "30 Songs",
			value: "30"
		}]
	};
	
	handleQualityChange = (event) => {
		let value = event.target.value;
		this.context.setPreferredQuality(value);
		this.context.notify("success", "Quality preference updated!")
	};
	
	handleSearchResLimitChange = (event) => {
		let value = event.target.value;
		this.context.setSearchResultLimit(value);
		this.context.notify("success", "Search results limit updated!")
	};
	
	render() {
		return e("section", { className: "animate-fade-in-up min-h-0 w-full px-3 md:px-8 lg:px-12 pt-4" },
			e("div", { className: "max-w-lg mx-auto" },
				e("div", { className: "w-full flex justify-between items-center gap-4 mb-4" },
					e("h3", { className: "text-sm text-neutral-200 leading-snug mb-1" }, "Audio Quality"),
					e("div", { className: "relative text-sm w-1/2" },
						e("select", {
								value: this.context.preferredQuality,
								onChange: this.handleQualityChange,
								className: "block appearance-none px-3 py-2 w-full rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-yellow-400 transition"
							},
							Settings.options.preferredQuality.map((opt, i) => (
								e("option", { value: opt.value }, opt.label)
							))
						),
						e("div", { className: "absolute inset-y-0 right-3 flex items-center pointer-events-none" },
							e("i", { className: "fa-solid fa-chevron-down text-neutral-400" })
						)
					)
				),
				
				e("div", { className: "w-full flex justify-between items-center gap-4 mb-4" },
					e("h3", { className: "text-sm text-neutral-200 leading-snug mb-1" }, "Search results limit"),
					e("div", { className: "relative text-sm w-1/2" },
						e("select", {
								value: this.context.searchResultsLimit,
								onChange: this.handleSearchResLimitChange,
								className: "block appearance-none px-3 py-2 w-full rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-yellow-400 transition"
							},
							Settings.options.searchResultsLimit.map((opt, i) => (
								e("option", { value: opt.value }, opt.label)
							))
						),
						e("div", { className: "absolute inset-y-0 right-3 flex items-center pointer-events-none" },
							e("i", { className: "fa-solid fa-chevron-down text-neutral-400" })
						)
					)
				)
			)
		)
	}
}

export default Settings;