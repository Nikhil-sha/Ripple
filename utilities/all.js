import React, { Fragment } from 'react';

const characterCode = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  euro: '€',
  copy: '©',
  reg: '®'
};

const secureURL = (url) => {
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  } else {
    return url;
  }
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const parts = formatter.formatToParts(date);
  
  const day = parts.find(p => p.type === 'day').value;
  const month = parts.find(p => p.type === 'month').value;
  const year = parts.find(p => p.type === 'year').value;
  
  return `${day} ${month}, ${year}`;
};

const capitalize = (text) => {
  if (!text) return "Undefined";
  
  const res = text.charAt(0).toUpperCase() + text.slice(1);
  return res;
};

const renderText = (text) => {
  return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (_, code) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCharCode(parseInt(code.slice(2), 16));
    } else if (code.startsWith('#')) {
      return String.fromCharCode(parseInt(code.slice(1), 10));
    } else {
      return characterCode[code] || `&${code};`; // fallback
    }
  });
};

const handleNewLine = (paragraph) => {
  if (!paragraph) return null;
  
  const lines = paragraph.split(/\r?\n/g);
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
};

const renderLyrics = (html) => {
  const parts = html.split(/<br\s*\/?>/gi);
  return parts.map((part, i) => (
    <Fragment key={i}>
			{part}
			{i < parts.length - 1 && <br />}
		</Fragment>
  ));
};

export {
  secureURL,
  formatTime,
  formatDate,
  capitalize,
  renderText,
  handleNewLine,
  renderLyrics,
};