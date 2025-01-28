import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<section className="h-full overflow-y-auto px-4 md:px-8 lg:px-12 pt-5 pb-20">
				<div className="max-w-sm mx-auto bg-yellow-100 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-4">
					<div className="flex gap-3 items-center">
						<i className="fas fa-info-circle fa-sm"></i>
						<p className="text-sm">
							<strong>Note:</strong> You are currently using a development version of this app. Features might be incomplete, and bugs may occur.
						</p>
					</div>
				</div>
				<div className="max-w-sm mx-auto bg-yellow-100 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-4">
					<div className="flex gap-3 items-center">
						<i className="fas fa-info-circle fa-sm"></i>
						<p className="text-sm">
							<strong>Note:</strong> Save the songs you like and play them from <b>Saved</b>, it will reduce the load on API.
						</p>
					</div>
				</div>
				<div className="max-w-sm mx-auto bg-yellow-100 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-4">
					<div className="flex gap-3 items-center">
						<i className="fas fa-info-circle fa-sm"></i>
						<p className="text-sm">
							<strong>Note:</strong> If you are facing problem in finding any song, then you can get that song by entering the link of Jio Saavn in the search bar.
						</p>
					</div>
				</div>
				<article className="max-w-sm mx-auto w-full p-2 px-4 bg-yellow-200 border-l-4 border-yellow-400 rounded-md mb-4">
					<p className="text-xs">{quoteData.quote}</p>
					<a 
						className="underline"
						href={`https://www.google.com/search?q=${encodeURIComponent(quoteData.quote + ' by "' + quoteData.author + '"')}`} 
						aria-label={`Search for quote: "${quoteData.quote}" by ${quoteData.author}`}
					>
						<i className="block text-xs text-right font-bold"> - {quoteData.author}</i>
					</a>
				</article>
				<article className="max-w-lg mx-auto w-full p-2 px-4">
					<h2 className="text-lg font-bold">Go ahead and jam to your favorite tracks while we cook up some awesome new features for you!</h2>
					<Link 
						to="/search" 
						className="text-sm text-blue-500 underline"
						aria-label="Go to search page"
					>
						<i className="fas fa-link fa-sm mr-2"></i>
						Go to search page
					</Link>
				</article>
			</section>
		);
	}
}

export default Home;