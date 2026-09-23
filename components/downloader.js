import { AppContext } from "../context.js";

import Button from './button.js';
import Spinner from './loadings/spinner.js';

class Downloader extends Component {
  static contextType = AppContext;
  
  static colors = [
    "stroke-yellow-400",
    "stroke-cyan-400",
    "stroke-pink-400",
    "stroke-lime-400",
    "stroke-orange-400",
    "stroke-indigo-400",
    "stroke-green-400",
    "stroke-blue-400",
    "stroke-purple-500",
    "stroke-rose-400",
  ];
  
  static queueCapacity = 9;
  
  state = {
    queue: [],
  };
  onPopState = null;
  hideTimeout = null;
  
  componentDidMount() {
    this.context.setDownloadMethod(this.downloadFile);
    this.props.open(this.handleToggle);
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data;
      
      if (data?.type === "NOTIFICATION_ACTION") {
        this.cancelDownload(data.id);
      }
    })
  }
  
  removePopState = () => {
    if (this.onPopState) {
      window.removeEventListener("popstate", this.onPopState);
      this.onPopState = null;
    }
  };
  
  handleToggle = (isBackNavigation = false) => {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    
    if (this.state.isVisible) {
      this.setState({ isHiding: true });
      
      this.hideTimeout = setTimeout(() => {
        this.removePopState();
        
        if (!isBackNavigation && window.history.state?.downloader) {
          window.history.back();
        }
        
        this.setState({
          isVisible: false,
          isHiding: false,
        });
      }, 250);
    } else {
      window.history.pushState({ downloader: true }, "Downloader", window.location.href);
      
      this.onPopState = () => this.handleToggle(true);
      window.addEventListener("popstate", this.onPopState, { once: true });
      
      this.setState({
        isHiding: false,
        isVisible: true,
      });
    }
  };
  
  sanitizeFilename = (name) => {
    if (typeof name !== 'string') {
      throw new TypeError('Filename must be a string');
    }
    
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    let cleanName = name.replace(invalidChars, '');
    
    cleanName = cleanName.trim();
    
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
    if (reservedNames.test(cleanName)) {
      cleanName = '_' + cleanName;
    }
    
    if (cleanName.length === 0) {
      cleanName = 'untitled';
    }
    
    return cleanName;
  };
  
  getDownloadSource = async (data) => {
    let url = this.context.getPreferredQualityURL(data.sources);
    
    let serverCheck = { ok: false };
    try {
      serverCheck = await fetch("https://the-ultimate-songs-download-server-python.vercel.app/");
    } catch (_) {}
    
    if (!serverCheck.ok) {
      this.context.notify("warning", "Metadata embedding server is not responding! Downloading raw file.");
    } else {
      const name = encodeURIComponent(data.name);
      const artistName = encodeURIComponent(data.artist);
      const cover = encodeURIComponent(data.coverBg);
      const albumName = encodeURIComponent(data.album);
      const year = encodeURIComponent(data.year);
      const rawSource = encodeURIComponent(url);
      
      url = `https://the-ultimate-songs-download-server-python.vercel.app/generate-audio?audioUrl=${rawSource}&imageUrl=${cover}&songName=${name}&artist=${artistName}&album=${albumName}&year=${year}`;
    }
    
    return url;
  };
  
  addToQueue = (newQueueItem) => {
    this.setState((prevState) => ({
      queue: [newQueueItem, ...prevState.queue],
    }));
  };
  
  markAsCancelling = (id) => {
    this.setState(prevState => ({
      queue: prevState.queue.map(i =>
        i.id === id ? { ...i, cancelling: true } : i
      )
    }));
  };
  
  removeFromQueue = (id) => {
    this.setState((prevState) => ({
      queue: prevState.queue.filter((i) => i.id !== id),
    }));
  };
  
  downloadFile = async (data) => {
    if (this.state.queue.some((i) => i.name === data.name)) return;
    if (this.state.queue.length >= Downloader.queueCapacity) {
      this.context.notify("error", "Wait for the previous tasks to be fulfilled!")
      return;
    };
    
    const filename = this.sanitizeFilename(`${data.name} - ${data.artist}.m4a`);
    
    let response,
      fileHandle,
      writable,
      id = data.id,
      controller = new AbortController(),
      sw,
      signal = controller.signal,
      addedToQueue = false,
      circumference = 2 * Math.PI * 17;
    
    try {
      await this.context.ensureDirectoryAccess();
      
      try {
        await this.context.downloadDir.getFileHandle(filename);
        this.context.notify("error", `${filename} already exists.`);
        return;
      } catch (_) {}
      
      const progressRef = createRef();
      this.addToQueue({
        id,
        name: data.name,
        image: data.coverSm,
        progressRef,
        color: Downloader.colors[this.state.queue.length % Downloader.colors.length],
        controller,
        cancelling: false,
      });
      addedToQueue = true;
      
      await new Promise((r) => requestAnimationFrame(r));
      
      this.context.notify("success", `Downloading ${filename}`);
      this.context.showSystemNotification(data.id, data.name, "Downloading...", data.coverSm, [{ action: "cancel", title: "Cancel Download" }], false);
      
      const downloadSource = await this.getDownloadSource(data);
      response = await fetch(downloadSource, { signal });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      const reader = response.body.getReader();
      if (!reader) throw new Error("ReadableStream not supported.");
      
      const fileSize = Number(response.headers.get("content-length")) || 0;
      const progress = progressRef.current;
      
      progress.style.strokeDasharray = `${circumference} ${circumference}`;
      progress.style.strokeDashoffset = circumference;
      
      fileHandle = await this.context.downloadDir.getFileHandle(filename, { create: true });
      writable = await fileHandle.createWritable();
      
      let total = 0;
      let percent = 0;
      const CHUNK_SIZE = 128 * 1024;
      
      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        
        await writable.write(value);
        total += value.length;
        
        const newPercent = (total / fileSize).toFixed(2);
        
        if (fileSize > 0 && newPercent !== percent) {
          progress.style.strokeDashoffset = circumference - newPercent * circumference;
          if (Math.floor(newPercent * 10) > Math.floor(percent * 10)) {
            this.context.showSystemNotification(data.id, data.name, `${'▰'.repeat(Math.floor(newPercent * 10))}${'▱'.repeat(10 - Math.floor(newPercent * 10))}`, data.coverSm, [{ action: "cancel", title: "Cancel Download" }], true);
          }
          percent = newPercent;
        }
        
        if (total % (CHUNK_SIZE * 20) === 0) {
          await new Promise((r) => requestAnimationFrame(r));
        }
      }
      
      if (signal.aborted) throw new Error("Fetch request aborted. Download cancelled.");
      
      await writable.close();
      this.context.notify(
        "success",
        `Downloaded ${filename} (${(total / 1048576).toFixed(2)} MB)`
      );
      this.context.showSystemNotification(data.id, data.name, "Downloaded!", data.coverSm, [], false);
    } catch (err) {
      if (writable) {
        try {
          await writable.close();
          if (!signal.aborted) controller.abort();
          await this.context.downloadDir.removeEntry(filename).catce(() => {});
        } catch (_) {}
      }
      
      this.context.showSystemNotification(data.id, data.name, "Failed!", data.coverSm, [], false);
      
      if (err.name === "QuotaExceededError") {
        this.context.notify(
          "error",
          "Your disk is full. Please free up some space and try again."
        );
      } else if (err.message.includes('abort')) {
        this.context.notify(
          "error",
          `${filename} canceled.`
        );
      } else {
        this.context.notify("error", `${filename} failed: ${err.message}`);
      }
    } finally {
      const exists = this.state.queue.some((i) => i.id === id);
      if (addedToQueue || exists) this.removeFromQueue(id);
    }
  };
  
  cancelDownload = (id) => {
    const item = this.state.queue.find((i) => i.id === id);
    if (!item || item.controller.signal.aborted) return;
    this.markAsCancelling(id);
    item.controller.abort();
    // this.removeFromQueue(id);
  };
  
  handleHide = (e) => {
    if (e.target !== e.currentTarget) return;
    this.handleToggle();
  };
  
  render() {
    return e("section", { onClick: this.handleHide, className: `min-w-0 ${this.state.isHiding ? "pointer-events-none " : ""}${this.state.isVisible ? "absolute inset-0 z-50 " : "hidden "}flex flex-col items-center justify-end bg-black/50 backdrop-blur-sm p-4` },
      e('div', { className: `${this.state.isHiding ? "animate-leave-down" : "animate-enter-up"} max-h-64 max-w-96 w-full h-full shadow-lg shadow-neutral-900/80 p-4 bg-neutral-800 rounded-3xl border border-neutral-700 flex flex-col overflow-hidden` },
        e("h2", { className: "text-lg font-bold text-neutral-200" }, "Downloading"),
        
        e("hr", { className: "border-neutral-700/50 my-2" }),
        
        this.state.queue.length ? (
          e("ul", { className: "animate-fade-in w-full h-fit max-h-[40dvh] flex flex-col gap-2 justify-start items-center overflow-y-scroll scroll-smooth" },
            this.state.queue.map((item) =>
              e("li", {
                  key: item.id,
                  className: "w-full inline-flex gap-2 items-center justify-between text-neutral-200"
                },
                e("div", { className: "relative inline-flex items-center justify-center" },
                  e("svg", { width: "40", height: "40", className: "transform -rotate-90" },
                    e("circle", {
                      ref: item.progressRef,
                      cx: "20",
                      cy: "20",
                      r: "17",
                      stroke: "currentColor",
                      className: `${item.color} transition-all duration-300 ease-in-out`,
                      strokeWidth: "3",
                      fill: "none",
                      strokeLinecap: "round"
                    })
                  ),
                  e("img", {
                    src: item.image,
                    alt: `downloading ${item.name}`,
                    className: "absolute rounded-full h-2/3"
                  })
                ),
                e("span", { className: "inline-block grow text-sm font-normal text-neutral-200 truncate" }, item.name),
                item.cancelling ? (
                  e(Spinner, { size: "8", strokeColor: "red-500" })
                ) : (
                  e(Button, {
                    icon: "times",
                    accent: "red",
                    roundness: "full",
                    label: `Cancel downloading ${item.name}.`,
                    clickHandler: () => this.cancelDownload(item.id)
                  })
                )
              )
            )
          )
        ) : (
          e("span", { className: "animate-fade-in text-sm text-neutral-400 text-center leading-none mt-1" }, "No Task!")
        )
      )
    )
  }
}

export default Downloader;