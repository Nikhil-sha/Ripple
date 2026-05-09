import { AppContext } from '../context.js';

import Song from '../components/song.js';
import Button from '../components/button.js';
import ErrorCard from '../components/error.js';
import { renderText } from '../utilities/all.js';
import LoadingSongs from '../components/loadings/loadingSongs.js';

class Search extends Component {
	static contextType = AppContext;
	
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			errorMessage: null,
			query: "",
			pageIndex: 1,
			history: null,
		};
		this.inputRef = createRef();
		this.abortController = null;
	}
	
	componentDidMount() {
		if (this.context.search.results.length) {
			this.setState({ query: this.context.search.query });
		} else {
			this.inputRef.current.focus();
		}
		
		this.loadHistory();
	}
	
	componentWillUnmount() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}
	
	setLoadingTrue = () => {
		this.setState({ loading: true });
	};
	
	setLoadingFalse = () => {
		this.setState({ loading: false });
	};
	
	setError = (message) => {
		this.setState({ error: true, loading: false, errorMessage: message });
	};
	
	setErrorFalse = () => {
		this.setState({ error: false });
	};
	
	handleInputChange = () => {
		this.setState({ query: this.inputRef.current.value });
	};
	
	loadHistory = () => {
		const savedHistory = JSON.parse(localStorage.getItem("searchHistory"));
		if (savedHistory && savedHistory.length) {
			this.setState({ history: savedHistory });
		}
	};
	
	updateHistory = (params) => {
		switch (params.type) {
			case 'addItem':
				// params = { type: 'addItem', item: String }
				this.updateHistory({
					history: this.state.history ? [params.item, ...this.state.history.filter((item) => item !== params.item)] : [params.item]
				});
				break;
				
			case 'remove':
				// params = { type: 'remove', item: String }
				this.updateHistory({
					history: [...this.state.history.filter((item) => item !== params.item)]
				});
				break;
				
			case 'clear':
				// params = { type: 'clear' }
				localStorage.removeItem("searchHistory");
				this.setState({ history: null });
				break;
				
			default:
				// params = { history: Array }
				const newHistory = params.history;
				if (newHistory.length > 6) {
					newHistory.splice(6);
				}
				localStorage.setItem("searchHistory", JSON.stringify(newHistory));
				this.setState({ history: newHistory });
		}
	};
	
	fetchResults = async (params) => {
		if (this.abortController) {
			this.abortController.abort();
		}
		
		this.setErrorFalse();
		this.setLoadingTrue();
		
		const { endpoints, updateSearchState } = this.context;
		
		this.abortController = new AbortController();
		const { signal } = this.abortController;
		
		const url = `${endpoints.search}?query=${params.query}&page=${params.page || 1}&limit=${this.context.searchResultsLimit || "15"}`;
		
		try {
			const response = await fetch(encodeURI(url), { signal });
			const data = await response.json();
			
			if (!data.success) {
				this.setError(data.message || "No results found.");
			} else {
				this.setLoadingFalse();
				const lastPageIndex = data.data.total > (data.data.start + data.data.results.length) ? Infinity : params.page;
				return { results: data.data.results, lastPageIndex };
			}
		} catch (e) {
			if (e.name !== 'AbortError') this.setError(e.message);
		}
	};
	
	handleSearch = async () => {
		const query = this.state.query?.trim();
		
		if (!query) {
			return;
		}
		
		const isUrl = query.startsWith("https://www.jiosaavn.com/") || query.startsWith("http://");
		if (isUrl) {
			const url = encodeURIComponent(query);
			this.props.history.push(`/song/${url}`);
			return;
		}
		
		if (this.context.search.query === query) {
			return;
		}
		
		if (this.state.pageIndex > 1) this.setState({
			pageIndex: 1,
		});
		
		const res = await this.fetchResults({ query });
		if (res.results && res.results.length) this.context.updateSearchState(query, res.results, res.lastPageIndex);
		
		this.updateHistory({ type: 'addItem', item: query });
	};
	
	searchFromHistory = (e) => {
		this.setState({ query: e.target.innerText },
			() => this.handleSearch());
	};
	
	handlePagination = async (dir) => {
		if (dir === 'next') {
			if (this.context.search.results.length <= (this.state.pageIndex)) {
				const res = await this.fetchResults({ query: this.context.search.query, page: this.state.pageIndex + 1 });
				if (!res.results || !res.results.length) return;
				this.context.updateSearchState(this.context.search.query, res.results, res.lastPageIndex);
			}
			this.setState((prevState) => ({
				pageIndex: prevState.pageIndex + 1,
			}));
		} else {
			if (this.abortController) {
				this.abortController.abort();
				this.setLoadingFalse();
			}
			
			this.setState((prevState) => ({
				pageIndex: Math.max((prevState.pageIndex - 1), 1),
			}));
		}
		
		await new Promise((r) => requestAnimationFrame(r));
		this.inputRef.current.scrollIntoView({
			behavior: "smooth",
			block: "nearest"
		});
	};
	
	render() {
		const {
			loading,
			error,
			errorMessage,
			history,
			query,
			pageIndex,
		} = this.state;
		
		return e(
			"section", { className: "animate-fade-in-up min-h-0 w-full max-w-md px-3 pt-4 mx-auto" },
			e(
				"div", { className: "min-h-full flex flex-col justify-start items-center" },
				e(
					"form",
					{
						method: "GET",
						onSubmit: (e) => {
							e.preventDefault();
							this.handleSearch();
						},
						className: "flex gap-2 w-full"
					},
					e("input", {
						type: "text",
						ref: this.inputRef,
						value: query,
						required: true,
						onChange: this.handleInputChange,
						placeholder: "Search for songs or enter JioSaavn song Url...",
						className: "grow px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-yellow-400 placeholder-neutral-400 transition"
					}),
					e(
						"button",
						{
							type: "submit",
							"aria-label": "Search",
							className: "flex-shrink-0 bg-yellow-400/20 active:bg-yellow-400/30 text-yellow-400 font-semibold px-6 py-3 rounded-xl transition"
						},
						e("i", { className: "fa-solid fa-search" })
					)
				),
				
				history ? e(
					"ul", { className: "w-full flex gap-3 overflow-x-auto mt-4" },
					history.map((item) => e(
						"li",
						{
							key: item,
							role: "button",
							onClick: this.searchFromHistory,
							className: "animate-fade-in w-fit flex-shrink-0 text-neutral-400 text-sm px-3 py-1 rounded-full bg-neutral-800 transition-[background-color] duration-300 hover:bg-neutral-700"
						},
						item
					))
				) : null,
				
				loading || error || this.context.search.results.length ? e(
					"section", { className: "w-full flex flex-col justify-start items-center mt-4 gap-3" },
					e(
						"h2", { className: "animate-fade-in w-full text-lg font-normal text-neutral-200 leading-snug" },
						loading ? 'Hold on…' : error ? 'An Error occurred!' : `Results for "${this.context.search.query}"`
					),
					error ? e(ErrorCard, { errorContext: errorMessage }) :
					loading ? e(LoadingSongs, { list: "5" }) :
					this.context.search.results[pageIndex - 1].map((song) => e(Song, {
						key: song.id,
						songId: song.id,
						name: renderText(song.name),
						artist: renderText(song.artists.primary[0].name),
						album: renderText(song.album.name),
						year: song.year,
						coverSm: song.image[0].url,
						coverBg: song.image[song.image.length - 1].url,
						sources: song.downloadUrl,
						option: "save"
					})),
					!error && e(
						"div",
						{
							className: "flex items-center justify-center gap-4 my-4",
							role: "navigation",
							"aria-label": "Pagination Navigation"
						},
						e(Button, {
							accent: "yellow",
							roundness: "xl",
							icon: "chevron-left",
							label: "Go to previous search page",
							clickHandler: () => this.handlePagination('prev'),
							disabled: pageIndex <= 1
						}),
						e("span", { className: "text-base font-normal text-neutral-200" }, pageIndex),
						e(Button, {
							accent: "yellow",
							roundness: "xl",
							icon: "chevron-right",
							label: "Go to next search page",
							clickHandler: () => this.handlePagination('next'),
							...((this.context.search.lastPageIndex <= pageIndex) || loading || error ? { disabled: true } : false)
						})
					)
				) : e(
					"div", { className: "animate-fade-in w-full mt-4" },
					e("p", { className: "font-normal text-center text-neutral-600" }, "What's on your mind today?")
				)
			)
		)
	}
}

export default withRouter(Search);