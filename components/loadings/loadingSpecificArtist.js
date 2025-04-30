import React, { Component } from 'react';

class LoadingSpecificArtist extends Component {
	render() {
		return (
			<div className="animate-fade-in-up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<div className="w-full flex flex-col justify-center items-center">
					<div className="animate-pulse relative w-2/4 md:w-1/4 aspect-square rounded-lg overflow-hidden bg-neutral-200/75"></div>
					<div className="mt-4 text-center">
      <div style={{animationDelay: "200ms"}} className="animate-pulse h-6 w-48 bg-neutral-200/75 mx-auto mb-2 rounded-md"></div>
      <div style={{animationDelay: "400ms"}} className="animate-pulse h-4 w-40 bg-neutral-200/75 mx-auto mb-1 rounded-md"></div>
      <div style={{animationDelay: "600ms"}} className="animate-pulse h-4 w-24 bg-neutral-200/75 mx-auto rounded-md"></div>
     </div>
    </div>

				<div className="w-full max-w-lg mt-8 mb-4 mx-auto">
					<div style={{animationDelay: "800ms"}} className="animate-pulse h-5 w-60 bg-neutral-200/75 rounded-md mb-3"></div>

					<div style={{animationDelay: "1s"}} className="animate-pulse h-5 w-36 bg-neutral-200/75 rounded-md mt-4 mb-2"></div>
					<div style={{animationDelay: "1.2s"}} className="animate-pulse flex flex-col gap-3">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-14 w-full bg-neutral-200/75 rounded-md"></div>
					))}
					</div>

   	 <div className="h-5 w-40 bg-neutral-200/75 rounded-md mt-6 mb-2"></div>
    		<div style={{animationDelay: "1.4s"}} className="animate-pulse flex flex-col gap-2">
    		{[...Array(3)].map((_, i) => (
    			<div key={i} className="h-5 w-48 bg-neutral-200/75 rounded-md"></div>
    		))}
    	</div>
   	</div>
  	</div>
		);
	}
}


export default LoadingSpecificArtist;