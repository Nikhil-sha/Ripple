import { AppContext } from '../context.js';

import Button from './button.js';

class Song extends Component {
	static contextType = AppContext;
	
	addToPlayList = (event) => {
		event.stopPropagation();
		const { songId, name, artist, album, year, coverSm, coverBg, sources } = this.props;
		const track = {
			id: songId,
			name,
			artist,
			album,
			year,
			sources,
			coverSm,
			coverBg,
		};
		this.context.updatePlayList([track, ...this.context.playList]); // Updates the playlist context
		setTimeout(() => this.context.playerMethods.setTrack(0), 100);
		console.log(track)
	};
	
	saveThis = (event) => {
		event.stopPropagation();
		const { songId, name, artist, album, year, coverSm, coverBg, sources } = this.props;
		const track = {
			id: songId,
			name,
			artist,
			album,
			year,
			sources,
			coverSm,
			coverBg,
		};
		this.context.updateLocalStorage(track);
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
			e(Button, {
				accent: "yellow",
				icon: "heart",
				roundness: "full",
				label: `Add ${name} to Saved`,
				clickHandler: this.saveThis
			}) :
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