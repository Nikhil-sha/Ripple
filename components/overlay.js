import React, { Component } from 'react';
import { AppContext } from '../context';

class Overlay extends Component {
	static contextType = AppContext;

	close = () => {
		this.context.hideOverlay();
		this.props.onClose();
	};

	render() {
		return (
			<section onClick={this.close} className={`fixed inset-0 z-40 transition-all duration-300 ${this.context.isOverlayVisible ? "opacity-1 bg-black/50" : "opacity-0 pointer-events-none"}`} aria-hidden="true">
			</section>
		);
	}
}

export default Overlay;