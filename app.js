import ErrorBoundary from './errorBoundary.js';
import { AppProvider, AppContext } from './context.js';

import Header from './components/header.js';
import Player from './components/player.js';
import Options from './components/options.js';

import Home from './pages/home.js';
import Search from './pages/search.js';
import SongDetails from './pages/song.js';
import PlaylistDetails from './pages/playlist.js';
import AlbumDetails from './pages/album.js';
import ArtistDetails from './pages/artist.js';
import Saved from './pages/saved.js';
import Downloads from './pages/downloads.js';
import Settings from './pages/settings.js';
import Redirect from './pages/redirect.js';
import NotFound from './pages/notFound.js';

class App extends React.Component {
  static contextType = AppContext;
  
  componentDidMount() {
    this.context.setPreferredQuality("stored");
    this.context.setSearchResultLimit("stored");
  }
  
  render() {
    return (
      e(HashRouter, null,
        e("div", { className: "relative h-full flex flex-col w-full overflow-hidden" },
          e(Header, null),
          
          e("main", { className: "bg-gradient-to-t from-blue-400/5 to-transparent to-50% w-full min-h-0 grow overflow-y-auto pb-[65px]" },
            e(Switch, null,
              e(Route, { exact: true, path: "/", component: Home }),
              e(Route, { path: "/search", component: Search }),
              e(Route, { path: "/saved", component: Saved }),
              e(Route, { path: "/settings", component: Settings }),
              e(Route, { path: "/downloads", component: Downloads }),
              e(Route, { path: "/song/:songId", component: SongDetails }),
              e(Route, { path: "/playlist/:playlistId", component: PlaylistDetails }),
              e(Route, { path: "/album/:albumId", component: AlbumDetails }),
              e(Route, { path: "/artist/:artistId", component: ArtistDetails }),
              e(Route, { path: "/redirect/:url", component: Redirect }),
              e(Route, { path: "*", component: NotFound }),
            )
          ),
          
          e(Player, null),
          e(Options, null),
        )
      )
    )
  }
}


ReactDOM.render(
  e(ErrorBoundary, null,
    e(AppProvider, null,
      e(App, null)
    )
  ),
  document.getElementById('react-app')
);