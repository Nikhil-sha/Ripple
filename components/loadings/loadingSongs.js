class LoadingSongs extends Component {
	render() {
		return (
			e("div", { className: "animate-fade-in w-full max-w-md flex flex-col" },
				[...Array(parseInt(this.props.list))].map((_, i) =>
					e("div", { style: { animationDelay: `${i * 300}ms` }, className: "animate-pulse w-full p-2 flex items-center gap-3" },
						e("div", { className: "size-14 flex-shrink-0 rounded-xl bg-neutral-800" }),
						e("div", { className: "grow min-w-0" },
							e("span", { "aria-hidden": "true", className: "block w-full h-3.5 rounded-lg bg-neutral-800 mb-1.5" }),
							e("span", { "aria-hidden": "true", className: "block w-1/2 h-3 rounded-lg bg-neutral-800 mb-1.5" }),
							e("span", { "aria-hidden": "true", className: "block w-2/3 h-3 rounded-lg bg-neutral-800" })
						),
						e("span", { "aria-hidden": "true", className: "flex-shrink-0 size-8 rounded-full bg-neutral-800" }),
						e("span", { "aria-hidden": "true", className: "flex-shrink-0 size-8 rounded-full bg-neutral-800" })
					)
				)
			)
		)
	}
}

export default LoadingSongs;