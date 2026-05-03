import { AppContext } from '../context.js';

class Settings extends Component {
	static contextType = AppContext;
	
	static options = {
		audioQuality: [
			{
				label: "12kbps",
				value: "12kbps"
			}
		],
		searchResultsLimit: [
			
		]
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
							e("option", { value: "12kbps" }, "12 Kbps (low)"),
							e("option", { value: "48kbps" }, "48 Kbps"),
							e("option", { value: "96kbps" }, "96 Kbps (mid)"),
							e("option", { value: "160kbps" }, "160 Kbps (pref)"),
							e("option", { value: "320kbps" }, "320 Kbps (high)")
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
							e("option", { value: "5" }, "5"),
							e("option", { value: "10" }, "10"),
							e("option", { value: "15" }, "15"),
							e("option", { value: "20" }, "20"),
							e("option", { value: "30" }, "30")
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