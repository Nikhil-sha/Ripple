import React, { Component, createRef } from "react";
import { AppContext } from "../context";

import { checkResponseCode } from '../components/utilities/all';

class Downloader extends Component {
  static contextType = AppContext;
  
  static colors = [
    { bg: "bg-blue-100", ring: "text-yellow-500" },
    { bg: "bg-red-100", ring: "text-cyan-500" },
    { bg: "bg-green-100", ring: "text-pink-500" },
    { bg: "bg-purple-100", ring: "text-lime-500" },
    { bg: "bg-teal-100", ring: "text-orange-500" },
    { bg: "bg-orange-100", ring: "text-indigo-500" },
    { bg: "bg-pink-100", ring: "text-green-500" },
    { bg: "bg-yellow-100", ring: "text-blue-500" },
    { bg: "bg-gray-100", ring: "text-purple-600" },
    { bg: "bg-sky-100", ring: "text-rose-500" },
  ];
  
  state = {
    queue: [],
  };
  
  componentDidMount() {
    this.context.setDownloadMethod(this.downloadFile);
  }
  
  generateId = () => Math.random().toString(36).substr(2, 9);
  
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
  }
  
  addToQueue = (newQueueItem) => {
    this.setState((prevState) => ({
      queue: [newQueueItem, ...prevState.queue],
    }));
  };
  
  removeFromQueue = (id) => {
    this.setState((prevState) => ({
      queue: prevState.queue.filter((i) => i.id !== id),
    }));
  };
  
  downloadFile = async (url, filename, image) => {
    filename = this.sanitizeFilename(filename);
    if (this.state.queue.some((i) => i.name === filename)) return;
    
    let response,
      fileHandle,
      writable,
      id = this.generateId(),
      controller = new AbortController(),
      signal = controller.signal,
      addedToQueue = false,
      circumference;
    
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
        name: filename,
        image,
        progressRef,
        colorSet: Downloader.colors[this.state.queue.length % Downloader.colors.length],
        controller
      });
      addedToQueue = true;
      
      await new Promise((r) => requestAnimationFrame(r));
      
      this.context.notify("success", `Downloading ${filename}`);
      response = await fetch(url, { signal });
      checkResponseCode(response);
      
      const reader = response.body.getReader();
      if (!reader) throw new Error("ReadableStream not supported.");
      
      const fileSize = Number(response.headers.get("content-length")) || 0;
      const progress = progressRef.current;
      circumference = 2 * Math.PI * 12;
      
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
    item.controller.abort();
    this.removeFromQueue(id);
  };
  
  render() {
    if (!this.state.queue.length) return null;
    
    return (
      <section className="animate-fade-in-up min-h-0 sticky top-0 z-10 w-full px-4 md:px-8 lg:px-12 pt-4">
        <ul className="max-w-lg w-full mx-auto p-1 flex gap-1 justify-start items-center overflow-x-auto scroll-smooth bg-white/75 backdrop-blur-sm border border-neutral-200 rounded-xl">
          {this.state.queue.map((item) => (
            <li
              key={item.id}
              className={`flex-shrink-0 inline-flex gap-1 overflow-x-scroll items-center justify-start p-1 rounded-xl w-32 text-black ${item.colorSet.bg}`}
            >
              <div className="relative inline-flex items-center justify-center">
                <svg width="30" height="30" className="transform -rotate-90">
                  <circle
                    ref={item.progressRef}
                    cx="15"
                    cy="15"
                    r="12"
                    stroke="currentColor"
                    className={`${item.colorSet.ring} transition-all duration-300 ease-in-out`}
                    strokeWidth="2"
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
              <span className="text-sm font-normal truncate">{item.name}</span>
              <span
                className="flex-shrink-0 size-6 fa-solid fa-times inline-flex justify-center items-center rounded-full text-neutral-700 hover:bg-red-400 hover:text-neutral-100 transition-all"
                onClick={() => this.cancelDownload(item.id)}
                aria-label={`Remove ${item.name} from download.`}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

export default Downloader;