import React, { Component } from 'react';

class Button extends Component {
	render() {
		const { accent, icon, roundness, label, clickHandler, disabled } = this.props;
		
		return (
			<button 
				onClick={clickHandler} 
				className={`flex-shrink-0 size-8 flex justify-center items-center rounded-${roundness} border border-neutral-700 hover:border-${accent}-400 text-neutral-400 hover:text-${accent}-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-neutral-400 disabled:hover:border-neutral-700`}
				aria-label={label}
				disabled={disabled || false}
			>
				<i className={`fa-solid fa-${icon}`}></i>
			</button>
		);
	}
}

export default Button;