import { AppContext } from '../context.js';

import Button from '../components/button.js'

class Downloads extends Component {
	static contextType = AppContext;
	
	state = {
		files: []
	}
	
	async componentDidMount() {
		const { downloadDir, downloadedFiles, loadDownloadedFiles } = this.context;
		if (downloadDir && !downloadedFiles.length) loadDownloadedFiles();
	}
	
	selectFolder = async () => {
		if (!this.context.downloadDir) {
			await this.context.ensureDirectoryAccess();
		}
		
		this.context.loadDownloadedFiles();
	};
	
	deleteFile = async (fileName) => {
		if (!confirm(`Do you want to delete ${fileName} permanently?`)) return;
		try {
			await this.context.downloadDir.removeEntry(fileName);
			this.context.notify('success', `Deleted ${fileName}`);
			this.context.loadDownloadedFiles();
		} catch (e) {
			this.context.notify('error', e.message);
		}
	};
	
	render() {
		return e("section", { className: "animate-fade-in-up min-h-0 max-w-md mx-auto w-full px-3 md:px-8 lg:px-12 pt-4" },
			e("article", { className: "p-4 w-full rounded-xl bg-neutral-900 text-neutral-400 mb-4" },
				e("p", { className: "text-sm" }, "Playing local files is not supported yet. You can see the files and delete duplicates if any.")
			),
			
			this.context.downloadDir ? e("div", { className: "animate-fade-in" },
				e("div", { className: "w-full inline-flex justify-between items-center mb-3" },
					e("h2", { className: "w-full text-lg font-normal text-neutral-200 leading-snug" }, "Files from the selected folder"),
					e(Button, {
						accent: "yellow",
						icon: "rotate-right",
						roundness: "full",
						clickHandler: this.context.loadDownloadedFiles,
						label: "Refresh files"
					})
				),
				e("ul", null,
					!this.context.downloadedFiles.length ? (
						e("li", { className: "animate-fade-in w-full text-neutral-400 flex items-center justify-center" },
							e("span", null, "There is nothing here!")
						)
					) : this.context.downloadedFiles.map((file, index) =>
						e("li", {
								key: index,
								className: "animate-fade-in p-2 w-full text-neutral-200 flex items-center justify-between gap-3 rounded-xl hover:bg-neutral-900 transition-colors duration-300"
							},
							e("span", { className: "flex-shrink-0 size-10 rounded-xl flex justify-center items-center bg-gradient-to-b from-neutral-700 to-neutral-800" },
								e("i", { className: "fa-solid fa-headphones text-yellow-400" })
							),
							e("span", { className: "min-w-0 w-full truncate" }, file.name),
							e(Button, {
								icon: "trash",
								accent: "red",
								roundness: "full",
								label: `Delete ${file.name}`,
								clickHandler: () => this.deleteFile(file.name)
							})
						)
					)
				)
			) : e("div", { className: "px-4 py-3 w-full rounded-xl bg-neutral-900" },
				e("h2", { className: "text-lg text-neutral-200 mb-2" }, "No Folder Selected!"),
				e("p", { className: "text-sm text-neutral-400 mb-4" }, "Select a Folder on your device to download and manage song files."),
				e("button", {
					className: "p-2 w-full text-neutral-200 text-center rounded-xl bg-neutral-700 hover:bg-neutral-800 transition-colors duration-300",
					onClick: this.selectFolder
				}, "Select a Folder")
			)
		)
	}
}

export default Downloads;