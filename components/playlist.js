class Playlist extends Component {
	render() {
		const { id, name, cover } = this.props;
		
		return (
			e("div", { className: "size-[9.2rem] flex-shrink-0 bg-neutral-800 rounded-2xl overflow-hidden" },
				e(Link, { to: `/playlist/${id}`, className: "contents" },
					e("img", { src: cover || "./assets/images/icons/144.png", alt: name, className: "size-full" }),
				)
			)
		)
	}
}

export default Playlist;