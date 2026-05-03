class Spinner extends Component {
	render() {
		const { size, strokeColor } = this.props;
		
		return (
			e("div", { className: `flex-shrink-0 size-${size} animate-spin` },
				e("svg", { className: "w-full h-full", viewBox: "0 0 50 50" },
					e("circle", {
							className: `stroke-${strokeColor} animate-dash`,
							cx: "25",
							cy: "25",
							r: "20",
							fill: "none",
							"stroke-width": "5",
							"stroke-linecap": "round"
						}
					)
				)
			)
		);
	}
}

export default Spinner;