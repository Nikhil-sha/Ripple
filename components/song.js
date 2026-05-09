import { AppContext } from '../context.js';

import Button from './button.js';

class Song extends Component {
	static contextType = AppContext;
	
	state = {
		track: {
			id: this.props.songId,
			name: this.props.name,
			artist: this.props.artist,
			album: this.props.album,
			year: this.props.year,
			coverSm: this.props.coverSm,
			coverBg: this.props.coverBg,
			sources: this.props.sources
		},
		optionsExpanded: false
	};
	
	expandOptions = () => {
		this.setState(prevState => ({
			optionsExpanded: !prevState.optionsExpanded
		}))
	};
	
	addToPlayList = () => {
		this.context.updatePlayList([this.state.track, ...this.context.playList]); // Updates the playlist context
		setTimeout(() => this.context.playerMethods.setTrack(0), 100);
		console.log(this.state.track)
	};
	
	saveThis = () => {
		this.context.updateLocalStorage(this.state.track);
	};
	
	downloadThis = () => {
		this.context.downloadMethod(this.state.track);
	};
	
	deleteThis = () => {
		let confirmation = confirm("Do you really want to remove this song from Saved?");
		if (confirmation) {
			this.context.removeTrackFromLocalStorage(this.props.songId);
		}
	};
	
	render() {
		const { songId, name, artist, album, year, coverSm, tailwind, option } = this.props;
		
		return e("div", { className: `animate-fade-in w-full p-2 flex flex-row items-center gap-3 rounded-xl hover:bg-neutral-900 transition-colors duration-300 ${tailwind || ""}` },
			e(Link, { to: `/song/${songId}`, className: "min-w-0 grow flex items-center gap-3" },
				e("div", { className: "shrink-0 size-14 overflow-hidden rounded-xl" },
					e("img", {
						className: "w-full h-full object-cover",
						src: coverSm,
						alt: `Cover for ${name} by ${artist}`
					})
				),
				e("div", { className: "min-w-0 grow" },
					e("h2", { className: "text-sm font-normal text-neutral-200 truncate" }, name),
					e("p", { className: "text-xs text-neutral-400 truncate" }, artist),
					e("p", { className: "text-xs text-neutral-400 truncate" }, album)
				)
			),
			e(Button, {
				accent: "yellow",
				icon: "play",
				roundness: "full",
				label: `Add ${name} to your playlist`,
				clickHandler: this.addToPlayList
			}),
			option === "save" ?
			e('div', { className: "relative size-fit" },
				e(Button, {
					accent: "yellow",
					icon: "ellipsis-vertical",
					roundness: "full",
					label: `Add ${name} to Saved`,
					clickHandler: this.expandOptions
				}),
				e('div', { className: `absolute z-10 top-9 shadow-lg right-0 bg-neutral-800 rounded-2xl border border-neutral-700 p-1 ${this.state.optionsExpanded ? 'block' : 'hidden'}` },
					[
						{ label: "Add to Saved", icon: "heart", handler: this.saveThis },
						{ label: "Download", icon: "download", handler: this.downloadThis }
					].map((item) => (e('button', { onClick: item.handler, className: "w-full text-neutral-200 group flex items-center text-xs text-nowrap px-3 py-2 rounded-xl hover:bg-neutral-700 transition-colors duration-500" },
						e('i', { className: `fa-solid fa-${item.icon} text-neutral-400 group-hover:text-yellow-400 mr-2 text-center transition-colors duration-500` }),
						item.label
					)))
				)
			) :
			option === "delete" ?
			e(Button, {
				accent: "red",
				icon: "times",
				roundness: "full",
				label: `Delete ${name}`,
				clickHandler: this.deleteThis
			}) : ''
		)
	}
}

export default Song;