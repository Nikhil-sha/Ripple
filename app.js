import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './errorBoundary';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Header from './components/header';
import Aside from './components/aside';
import Player from './components/player';

import Home from './pages/home';
import Search from './pages/search';
import SongDetails from './pages/song';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isAsideVisible: false,
			search: { query: null, results: null },
			specificSongDetails: null,
			playList: [],
		};
	}

	handleAsideToggle = () => {
		this.setState((prevState) => ({
			isAsideVisible: !prevState.isAsideVisible,
		}));
	};

	updateSearchState = (query, results) => {
		this.setState({
			search: {
				query: query,
				results: results,
			},
		});
	};

	setSpecificSongDetails = (newData) => {
		this.setState({
			specificSongDetails: newData,
		});
	};

	updatePlayList = (newPlayList) => {
		const uniqueTrackIds = new Set();
		const filteredPlayList = newPlayList.filter(track => {
			if (!uniqueTrackIds.has(track.id)) {
				uniqueTrackIds.add(track.id);
				return true;
			}
			return false;
		});

		this.setState({
			playList: filteredPlayList,
		});

		console.log("Incoming filtered playlist", filteredPlayList);
	};

	render() {
		return (
			<ErrorBoundary>
				<HashRouter>
					<div className="h-dvh w-screen relative flex flex-col">
						<Header onAsideToggle={this.handleAsideToggle} />
						<Aside isVisible={this.state.isAsideVisible} onAsideToggle={this.handleAsideToggle} />
						<div className="min-h-0 grow">
							<Switch>
								<Route exact path="/" render={(props) => <Home playList={this.state.playList} updatePlayList={this.updatePlayList} />} />
								<Route path="/search" render={(props) => <Search state={this.state.search} handleUpdate={this.updateSearchState} />} />
								<Route path="/song/:songId" render={(props) => <SongDetails {...props} song={this.state.specificSongDetails} handleUpdate={this.setSpecificSongDetails} playList={this.state.playList} updatePlayList={this.updatePlayList} />} />
								<Route path="*" render={() => <div className="text-center mt-10">Page not found</div>} />
							</Switch>
						</div>
						<Player playList={this.state.playList} updatePlayList={this.updatePlayList} />
					</div>
				</HashRouter>
			</ErrorBoundary>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('react-app'));