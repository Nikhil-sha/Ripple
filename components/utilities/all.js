import React from 'react';

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

const checkResponseCode = (response) => {
	if (!response.ok) {
		if (response.status >= 500) {
			throw new Error("Oops! A server error occurred, please try again later.");
		} else if (response.status >= 400) {
			throw new Error("Oops! There's nothing to see here.");
		} else {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}
	}
};

const secureURL = (url) => {
	if (url.startsWith("http://")) {
		return url.replace("http://", "https://");
	} else {
		return url;
	}
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

const renderLyrics = (html) => {
	const parts = html.split(/<br\s*\/?>/gi);
	return parts.map((part, i) => (
		<React.Fragment key={i}>
			{part}
			{i < parts.length - 1 && <br />}
		</React.Fragment>
	));
};

export {
	checkResponseCode,
	secureURL,
	renderText,
	renderLyrics,
};