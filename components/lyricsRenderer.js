import { AppContext } from "../context.js";

import Spinner from './loadings/spinner.js';

class LyricsRenderer extends Component {
	static contextType = AppContext;
	
	state = {
		lyrics: null,
		current: "",
		loading: true,
		error: ""
	};
	
	componentDidMount() {
		this.getLyrics();
	};
	
	componentDidUpdate(prevProps) {
		if (this.props.trackName !== prevProps.trackName || this.props.trackArtist !== prevProps.trackArtist) {
			this.getLyrics();
		} else if (this.props.currentTime !== prevProps.currentTime) {
			this.sync();
		}
	};
	
	getLyrics = async () => {
		this.setState({ loading: true, error: false });
		try {
			const lyrics = await this.context.searchLyricsDump(this.props.trackName, this.props.trackArtist);
			if (lyrics.synced === "NotFound") {
				this.setState({ lyrics: null, current: "" })
				throw new Error("Lyrics not found!");
			}
			this.setState({ lyrics: lyrics.synced.lyrics, current: "" }, this.sync);
		} catch (e) {
			if (e.name !== 'AbortError') this.setState({ error: e.message })
		} finally {
			this.setState({ loading: false });
		}
	};
	
	sync = () => {
		const { lyrics } = this.state;
		if (!lyrics) return;
		
		const scores = [];
		
		lyrics.forEach(lyric => {
			const score = this.props.currentTime - lyric.time;
			if (score >= 0) scores.push(score);
		});
		
		if (scores.length == 0) return null;
		
		const closest = Math.min(...scores);
		const lineIndex = scores.indexOf(closest);
		
		this.setState({
			current: lyrics[lineIndex].text
		})
	};
	
	render() {
		return (
			e('div', { className: `text-balanced inline-flex justify-center items-center p-6 px-12 absolute bg-black/30 backdrop-blur-sm inset-0 animate-fade-${this.props.startToUnmount ? "out" : "in"}` },
				e('span', { key: this.state.loading ? "loading" : this.state.error ? this.state.error : this.state.current || "...", style: {}, className: "text-3xl text-white/80 text-center font-extrabold leading-tight animate-fade-in" }, this.state.loading ? "HOLD ON" : this.state.error ? this.state.error : this.state.current || "...")
			)
		)
	}
}

export default LyricsRenderer;