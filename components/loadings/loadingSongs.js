import React, { Component } from 'react';

class LoadingSongs extends Component {
	render() {
		return (
			<div className="animate-fade-in w-full max-w-md flex flex-col mt-4">
				{this.props.children}

				{[...Array(parseInt(this.props.list))].map((_, i) => (
					<div style={{animationDelay: `${i * 300}ms`}} className="animate-pulse w-full py-2 px-3 flex items-center gap-3">
						<div className="w-12 h-12 flex-shrink-0 rounded-md bg-neutral-200/75">
						</div>
						<div className="grow min-w-0">
							<span aria-hidden="true" className="block w-full h-4 rounded-md bg-neutral-200/75 mb-2.5"></span>
							<span aria-hidden="true" className="block w-full h-3 rounded-md bg-neutral-200/75"></span>
						</div>
						<span aria-hidden="true" className="flex-shrink-0 size-8 rounded-full bg-neutral-200/75">
						</span>
						<span aria-hidden="true" className="flex-shrink-0 size-8 rounded-full bg-neutral-200/75">
						</span>
					</div>
				))}
			</div>
		);
	}
}

export default LoadingSongs;