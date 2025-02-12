import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './errorBoundary';
import { AppProvider, AppContext } from './context';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Header from './components/header';
import Aside from './components/aside';
import Popup from './components/popup';
import Player from './components/player';

import Home from './pages/home';
import Search from './pages/search';
import About from './pages/about';
import SongDetails from './pages/song';
import Saved from './pages/saved';
import Settings from './pages/settings';
import Notifications from './pages/notificationCenter';
import NotFound from './pages/notFound';

class App extends Component {
	static contextType = AppContext;

	componentDidMount() {
		this.context.setPreferredQuality("stored");
		this.context.setSearchLimit("stored");
	}

	render() {
		return (
			<React.StrictMode>
				<HashRouter>
					{this.context.isPopupVisible && <Popup />}
					<div className="h-dvh w-screen relative flex flex-col">
						<Header/>
						<Aside/>
						<div className="min-h-0 grow">
							<Switch>
								<Route exact path="/" component={Home}/>
								<Route path="/search" component={Search}/>
								<Route path="/about" component={About}/>
								<Route path="/saved" component={Saved}/>
								<Route path="/settings" component={Settings}/>
								<Route path="/notifications" component={Notifications}/>
								<Route path="/song/:songId" component={SongDetails} />
								<Route path="*" component={NotFound}/>
							</Switch>
						</div>
						<Player/>
					</div>
				</HashRouter>
			</React.StrictMode>
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