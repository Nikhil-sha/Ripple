import React, { Component, createRef } from "react";
import { AppContext } from "../context";

import Button from './button';
import Spinner from './loadings/spinner';

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
  
  state = {
    queue: [],
  };
  
  componentDidMount() {
    this.context.setDownloadMethod(this.downloadFile);
  }
  
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
  
  getDownloadSource = (data) => {
    const name = encodeURIComponent(data.name);
    const artistName = encodeURIComponent(data.artist);
    const cover = encodeURIComponent(data.coverBg);
    const albumName = encodeURIComponent(data.album);
    const year = encodeURIComponent(data.year);
    const rawSource = encodeURIComponent(this.context.getPreferredQualityURL(data.sources));
    
    const url = `https://the-ultimate-songs-download-server-python.vercel.app/generate-audio?audioUrl=${rawSource}&imageUrl=${cover}&songName=${name}&artist=${artistName}&album=${albumName}&year=${year}`;
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
    const filename = this.sanitizeFilename(`${data.name} - ${data.artist}.m4a`);
    if (this.state.queue.some((i) => i.name === filename)) return;
    
    let response,
      fileHandle,
      writable,
      id = data.id,
      controller = new AbortController(),
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
      response = await fetch(this.getDownloadSource(data), { signal });
      
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
      const CHUNK_SIZE = 128 * 1024;
      
      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        
        await writable.write(value);
        total += value.length;
        
        if (fileSize > 0) {
          const percent = total / fileSize;
          progress.style.strokeDashoffset = circumference - percent * circumference;
        }
        
        if (total % (CHUNK_SIZE * 20) === 0) {
          await new Promise((r) => requestAnimationFrame(r));
        }
      }
      
      if (signal.aborted) throw new Error("fetch request aborted");
      
      await writable.close();
      this.context.notify(
        "success",
        `Downloaded ${filename} (${(total / 1048576).toFixed(2)} MB)`
      );
    } catch (err) {
      if (writable) {
        try {
          await writable.close();
          if (!signal.aborted) controller.abort();
          await this.context.downloadDir.removeEntry(filename).catch(() => {});
        } catch (_) {}
      }
      
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
  
  render() {
    return (
      <section className={`${this.props.isVisible ? "" : "hidden"} origin-top-right ${this.props.willUnmount ? "animate-scale-down" : "animate-scale-up"} w-64 absolute top-full right-0 z-40 p-3 bg-neutral-800 rounded-2xl shadow-lg shadow-neutral-900/80 border border-neutral-700 flex flex-col mt-2 overflow-hidden`}>
    		<div className="flex justify-between items-center">
    			<h2 className="text-lg font-bold text-neutral-200">Downloading</h2>
    		</div>
    
    		<hr className="border-neutral-700/50 my-3" />
    
        {this.state.queue.length ? (<ul className="animate-fade-in w-full h-fit max-h-[40dvh] flex flex-col gap-2 justify-start items-center overflow-y-scroll scroll-smooth">
          {this.state.queue.map((item) => (
            <li
              key={item.id}
              className="w-full inline-flex gap-2 items-center justify-between text-neutral-200"
            >
              <div className="relative inline-flex items-center justify-center">
                <svg width="40" height="40" className="transform -rotate-90">
                  <circle
                    ref={item.progressRef}
                    cx="20"
                    cy="20"
                    r="17"
                    stroke="currentColor"
                    className={`${item.color} transition-all duration-300 ease-in-out`}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <img
                  src={item.image}
                  alt={`downloading ${item.name}`}
                  className="absolute rounded-full h-2/3"
                />
              </div>
              <span className="inline-block grow text-sm font-normal truncate">{item.name}</span>
              {item.cancelling ? (
                <Spinner size="8" strokeColor="blue-500" />
              ) : (
                <Button icon="times" accent="red" roundness="full" label={`Cancel downloading ${item.name}.`} clickHandler={() => this.cancelDownload(item.id)} />
              )}
            </li>
          ))}
        </ul>) : (<span className="animate-fade-in text-sm text-neutral-400 leading-none truncate">No file is being downloaded!</span>)}
      </section>
    );
  }
}

export default Downloader;