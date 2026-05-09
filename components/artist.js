class Artist extends Component {
	render() {
		const { artistId, name, image, role } = this.props;
		
		return (
			e("div", { className: "w-20 flex-shrink-0 flex flex-col items-center" },
				e(Link, { to: `/artist/${artistId}`, className: "contents" },
					e("img", { src: image !== '' ? image : './assets/images/avatar-placeholder.png', alt: name, className: "w-full aspect-square rounded-full mb-2" }),
					e("p", { className: "block min-w-0 w-full text-center text-xs font-normal text-neutral-200 truncate" }, name),
					e("span", { className: "block min-w-0 w-full text-center text-xs text-neutral-400 truncate" }, role)
				)
			)
		)
	}
}

export default Artist;