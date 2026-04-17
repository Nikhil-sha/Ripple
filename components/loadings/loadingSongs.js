import React, { Component } from 'react';

class LoadingSongs extends Component {
	render() {
		return (
			<div className="animate-fade-in w-full max-w-md flex flex-col">
				{[...Array(parseInt(this.props.list))].map((_, i) => (
					<div style={{animationDelay: `${i * 300}ms`}} className="animate-pulse w-full p-2 flex items-center gap-3">
						<div className="size-14 flex-shrink-0 rounded-xl bg-neutral-800">
						</div>
						<div className="grow min-w-0">
							<span aria-hidden="true" className="block w-full h-3.5 rounded-lg bg-neutral-800 mb-1.5"></span>
							<span aria-hidden="true" className="block w-1/2 h-3 rounded-lg bg-neutral-800 mb-1.5"></span>
							<span aria-hidden="true" className="block w-2/3 h-3 rounded-lg bg-neutral-800"></span>
						</div>
						<span aria-hidden="true" className="flex-shrink-0 size-8 rounded-full bg-neutral-800">
						</span>
						<span aria-hidden="true" className="flex-shrink-0 size-8 rounded-full bg-neutral-800">
						</span>
					</div>
				))}
			</div>
		);
	}
}

export default LoadingSongs;