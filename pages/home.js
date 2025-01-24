import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Home extends Component {
	constructor(props) {
		super(props);
	}
	
	addToPlayList = (track) => {
		this.props.updatePlayList([track, ...this.props.playList]);
	};

	render() {
		return (
			<section className="h-full overflow-y-auto p-4 pb-20">
				<div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-4">
					<div className="flex gap-3 items-center">
						<i className="fas fa-info-circle fa-sm"></i>
						<p className="text-sm">
							<strong>Note:</strong> You are currently using a development version of this app. Features might be incomplete, and bugs may occur.
						</p>
					</div>
				</div>
				<article className="w-full p-2 px-4 bg-yellow-200 border-l-4 border-yellow-400 rounded-md mb-4">
					<p className="text-xs">{quoteData.quote}</p>
					<p className="text-xs text-right font-semibold"> - {quoteData.author}</p>
				</article>
				<article className="w-full p-2 px-4">
					<h2 className="text-lg font-bold">Go ahead and jam to your favorite tracks while we cook up some awesome new features for you!</h2>
					<Link to="/search" className="text-sm text-blue-500 underline">
						<i className="fas fa-link fa-sm mr-2"></i>
						Go to search page
					</Link>
				</article>
			</section>
		)
	}
}

export default Home;