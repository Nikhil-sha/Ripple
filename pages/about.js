import React, { Component, Fragment } from 'react';

class About extends Component {
	render() {
		return (
			<section className="fade_in_up min-h-0 grow w-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-4 pb-[65px]">
				<article className="mb-8 max-w-lg mx-auto">
					<h1 className="text-xl font-extrabold text-neutral-800 leading-snug mb-2"><i className="text-base fas fa-hand text-yellow-400 mr-2.5"></i>Welcome to Ripple!</h1>
					<p className="text-sm text-neutral-600">
						This is a music webapp made using HTML5, CSS3(Tailwind.css) and JavaScript(React.js). You can find <a className="underline underline-offset-2 text-sky-400" href="https://github.com/Nikhil-sha/Ripple/">the repository</a> on GitHub.<br /><br />
						API used to make this possible: <a className="underline underline-offset-2 text-sky-400" href="https://saavn.dev/">Saavn.dev</a>
					</p>
				</article>
				<article className="max-w-lg mx-auto">
					<h2 className="text-lg font-bold text-neutral-800 leading-snug mb-4"><i className="w-6 text-left text-base fas fa-clipboard text-neutral-400"></i>ChangeLog</h2>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.5.1 (current)</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>lyrics support.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.5.0</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Improved UI.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.4.0</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Artist page added.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.3.0 (stable)</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Improved UI.</li>
				 		<li>Suggestions according to saved tracks, on Home page.</li>
				 		<li>Improved Haptic feedback.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.2.1</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>New <b>Search results limit</b> option added in Settings.</li>
				 		<li>Haptic feedback added.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.2.0</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>New <b>Quality Preference</b> added.</li>
				 		<li>New <b>Settings</b> section added.</li>
				 		<li>Improved UI.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.1.3 (stable)</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Changed Home page layout.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.1.2</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Highlight current track in player.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.1.1</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
				 		<li>Notification center added.</li>
				 		<li>Disabled <b>Scroll to refresh</b>.</li>
				 	</ol>
					</div>
					<div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.1.0</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
							<li>User can play the song from search page.</li>
							<li>User can save the song to <b>Local Storage</b> from search page and details page.</li>
							<li>User can access the saved song from <b>Saved</b> page.</li>
				 	</ol>
					</div>
				 <div className="mb-4">
				 	<h3 className="text-base font-bold text-neutral-800 leading-snug mb-3">Ver. 2.0.0</h3>
				 	<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-xs px-3">
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