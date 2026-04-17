import React, { Component } from 'react';

class Spinner extends Component {
	render() {
		const { size, strokeColor } = this.props;
		
		return (
			<div class={`flex-shrink-0 size-${size} animate-spin`}>
				<svg class="w-full h-full" viewBox="0 0 50 50">
					<circle class={`stroke-${strokeColor} animate-dash`} cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke-linecap="round"></circle>
				</svg>
			</div>
		);
	}
}

export default Spinner;