import { AppContext } from '../context.js';

import Button from './button.js';

class Song extends Component {
	static contextType = AppContext;
	
	state = {
		track: {
			id: this.props.id,
			name: this.props.name,
			artist: this.props.artist,
			album: this.props.album,
			year: this.props.year,
			coverSm: this.props.coverSm,
			coverBg: this.props.coverBg,
			sources: this.props.sources,
		}
	};
	
	optionsHandler = () => {
		this.context.setOptions([
			{
				isButton: true,
				label: "Download",
				icon: "download",
				handler: this.downloadThis
			},
			this.props.option === "save" ? {
				isButton: true,
				label: "Add to Saved",
				icon: "heart",
				handler: this.saveThis
			} : {
				isButton: true,
				label: "Remove from Saved",
				icon: "trash",
				handler: this.deleteThis
			}
		]);
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
			this.context.removeTrackFromLocalStorage(this.props.id);
		}
	};
	
	render() {
		const { id, name, artist, album, year, coverSm, tailwind, option } = this.props;
		
		return e("div", { className: `animate-fade-in w-full p-2 flex flex-row items-center gap-3 rounded-xl hover:bg-neutral-900 transition-colors duration-300 ${tailwind || ""}` },
			e(Link, { to: `/song/${id}`, className: "min-w-0 grow flex items-center gap-3" },
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
			e(Button, {
				accent: "yellow",
				icon: "ellipsis-vertical",
				roundness: "full",
				label: `More options`,
				clickHandler: this.optionsHandler
			}),
		)
	}
}

export default Song;