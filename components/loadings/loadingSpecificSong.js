import React, { Component } from 'react';

class LoadingSpecificSong extends Component {
	render() {
		return (
			<div className="animate-fade-in-up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<div className="w-full flex flex-col justify-center items-center">
					<div className="w-2/4 md:w-1/4 aspect-square rounded-lg bg-neutral-200/75"></div>
					<div className="mt-4 text-center space-y-2">
						<div style={{animationDelay: "200ms"}} className="animate-pulse h-6 w-32 bg-neutral-200/75 rounded mx-auto"></div>
						<div style={{animationDelay: "400ms"}} className="animate-pulse h-4 w-48 bg-neutral-200/75 rounded mx-auto"></div>
						<div style={{animationDelay: "600ms"}} className="animate-pulse h-3 w-28 bg-neutral-200/75 rounded mx-auto"></div>
						<div style={{animationDelay: "800ms"}} className="animate-pulse h-3 w-20 bg-neutral-200/75 rounded mx-auto"></div>
					</div>
				</div>

				<div className="w-fit flex flex-row gap-4 items-center mt-3 mx-auto">
					<div style={{animationDelay: "1s"}} className="animate-pulse rounded-full bg-neutral-200/75 w-12 h-12"></div>
					<div style={{animationDelay: "1.2s"}} className="animate-pulse rounded-full bg-neutral-200/75 w-12 h-12"></div>
				</div>

				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<div style={{animationDelay: "1.4s"}} className="animate-pulse h-5 w-40 bg-neutral-200/75 rounded mb-4"></div>
					<div className="space-y-2">
						<div style={{animationDelay: "1.6s"}} className="animate-pulse h-3 w-full bg-neutral-200/75 rounded"></div>
						<div style={{animationDelay: "1.8s"}} className="animate-pulse h-3 w-5/6 bg-neutral-200/75 rounded"></div>
						<div style={{animationDelay: "2s"}} className="animate-pulse h-3 w-3/4 bg-neutral-200/75 rounded"></div>
						<div style={{animationDelay: "2.2s"}} className="animate-pulse h-3 w-2/3 bg-neutral-200/75 rounded"></div>
					</div>
				</div>
			</div>
		);
	}
}

export default LoadingSpecificSong;