import React, { Component } from 'react';

class About extends Component {
	render() {
		return (
			<section className="w-full h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<article className="mb-8">
					<h1 className="text-xl font-bold text-gray-800 leading-snug mb-1"><i className="w-6 text-left text-md fas fa-hand text-yellow-400"></i>Welcome to Ripple!</h1>
					<p className="text-sm text-gray-600">This is a music webapp made using HTML5, CSS3 and JavaScript(React.js). You can find <a className="underline underline-offset-2 text-sky-400" href="https://github.com/Nikhil-sha/Ripple/">the repository</a> on GitHub.</p>
				</article>
				<article>
					<h2 className="text-lg font-bold text-gray-800 leading-snug mb-2"><i className="w-6 text-left text-md fas fa-clipboard text-gray-400"></i>ChangeLog</h2>
					<div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-4">
						<div className="flex gap-3 items-center">
							<i className="fas fa-info-circle fa-sm"></i>
							<p className="text-sm">
								<strong>Note:</strong> All the changes are listed here.
							</p>
						</div>
					</div>
					<div className="mb-4">
				 	<h3 className="text-md font-bold text-gray-800 leading-snug mb-3">Ver. 2.1.0</h3>
				 	<ol className="flex flex-col gap-2 list-decimal list-inside text-xs px-2">
				 		<li>User can search for music.</li>
				 		<li>User can see a detailed page about a song.</li>
							<li>User can play the song from search page.</li>
							<li>User can play the song from details page.</li>
							<li>User can save the song to <b>Local Storage</b> from search page and details page.</li>
							<li>User can access the saved song from <b>Saved</b> page.</li>
				 	</ol>
					</div>
				 <div className="mb-4">
				 	<h3 className="text-md font-bold text-gray-800 leading-snug mb-3">Ver. 2.0.0</h3>
				 	<ol className="flex flex-col gap-2 list-decimal list-inside text-xs px-2">
				 		<li>User can search for music.</li>
				 		<li>User can see a detailed page about a song.</li>
							<li>User can play the song from details page.</li>
				 	</ol>
					</div>
				</article>
			</section>
		)
	}
}

export default About;