import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './errorBoundary';
import { AppProvider, AppContext } from './context';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Header from './components/header';
import Player from './components/player';

import Home from './pages/home';
import Search from './pages/search';
import About from './pages/about';
import SongDetails from './pages/song';
import AlbumDetails from './pages/album';
import ArtistDetails from './pages/artist';
import Saved from './pages/saved';
import Downloads from './pages/downloads';
import Settings from './pages/settings';
import NotFound from './pages/notFound';

class App extends Component {
	static contextType = AppContext;

	componentDidMount() {
		this.context.setPreferredQuality("stored");
		this.context.setSearchResultLimit("stored");
		// this.context.ensureDirectoryAccess();
	}

	render() {
		return (
			<HashRouter>
				<div className="relative h-full flex flex-col w-full overflow-hidden">
					<Header />

					<main className="w-full min-h-0 grow overflow-y-auto pb-[65px]">
						<Switch>
							<Route exact path="/" component={Home} />
							<Route path="/search" component={Search} />
							<Route path="/about" component={About} />
							<Route path="/saved" component={Saved} />
							<Route path="/settings" component={Settings} />
							<Route path="/downloads" component={Downloads} />
							<Route path="/song/:songId" component={SongDetails} />
							<Route path="/album/:albumId" component={AlbumDetails} />
							<Route path="/artist/:artistId" component={ArtistDetails} />
							<Route path="*" component={NotFound} />
						</Switch>
					</main>

					<Player />
				</div>
			</HashRouter>
		);
	}
}

ReactDOM.render(
	<ErrorBoundary>
		<AppProvider>
			<App />
		</AppProvider>
	</ErrorBoundary>,
	document.getElementById('react-app')
);