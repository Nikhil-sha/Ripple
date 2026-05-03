class Album extends Component {
	render() {
		const { albumId, name, cover } = this.props;
		
		return (
			e("div", { className: "w-24 flex flex-col justify-center gap-2 flex-shrink-0" },
				e(Link, { to: `/album/${albumId}`, className: "contents" },
					e("img", { src: cover, alt: `cover for ${name}`, className: "w-full rounded-2xl aspect-square" }),
					e("span", { className: "block min-w-0 w-full text-center text-sm font-normal text-neutral-200 truncate" }, name)
				)
			)
		)
	}
}

export default Album;