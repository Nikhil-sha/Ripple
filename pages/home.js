import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
	render() {
		return (
			<section className="h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<div className="max-w-lg mx-auto w-full flex flex-row gap-4 justify-start items-center mb-4 overflow-x-auto">
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-cyan-500 to-cyan-400 rounded-lg">
						<Link to="/about" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-user fa-md text-white"></i>
							<span className="text-sm font-bold text-white">About</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-yellow-500 to-yellow-400 rounded-lg">
						<Link to="/search" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-search fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Search</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-blue-500 to-blue-400 rounded-lg">
						<Link to="/saved" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bookmark fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Saved</span>
						</Link>
					</div>
					<div className="flex-shrink-0 w-28 h-28 bg-gradient-to-tr from-rose-500 to-rose-400 rounded-lg">
						<Link to="/notifications" className="w-full h-full flex flex-col gap-1 justify-end items-start px-3 py-2">
							<i className="fas fa-bell fa-md text-white"></i>
							<span className="text-sm font-bold text-white">Notifications</span>
						</Link>
					</div>
				</div>
				
				<div className="max-w-lg w-full aspect-video relative rounded-lg overflow-hidden mx-auto mb-4">
					<img src="https://picsum.photos/1280/720.webp" className="absolute inset-0 brightness-75" />
					<p className="absolute left-4 bottom-4 w-3/4 text-sm font-semibold text-white drop-shadow-sm">The best music isn’t the most complex or critically acclaimed — it’s the one that makes you feel something. If a song moves you, it doesn’t matter how simple, mainstream, or overplayed it is. That’s real art.</p>
				</div>

				<article className="max-w-sm mx-auto w-full p-2 px-4 bg-yellow-200 border-l-4 border-yellow-400 rounded-md mb-4">
					<p className="text-xs">{quoteData.quote}</p>
					<a className="underline" href={`https://www.google.com/search?q=${encodeURIComponent(quoteData.quote + ' by "' + quoteData.author + '"')}`} aria-label={`Search for quote: "${quoteData.quote}" by ${quoteData.author}`}>
						<i className="block text-xs text-right font-bold"> - {quoteData.author}</i>
					</a>
				</article>
				<article className="max-w-lg mx-auto w-full p-2 px-4">
					<h2 className="text-lg font-bold">Go ahead and jam to your favorite tracks while we cook up some awesome new features for you!</h2>
					<Link to="/search" className="text-sm text-blue-500 underline" aria-label="Go to search page">
						<i className="fas fa-link fa-sm mr-2"></i>
						Go to search page
					</Link>
				</article>
			</section>
		);
	}
}

export default Home;