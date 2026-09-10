const { createElement: e, Fragment } = React;

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

const toPlusConv = (text) => {
	const words = text.trim().split(' ');
	return words.join('+');
};

const renderText = (text) => {
	if (!text) return "Undefined";
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
		e(Fragment, { key: i },
			line,
			i < lines.length - 1 && e("br", null)
		)
	));
};

const parseLRC = (lrcText) => {
	const lines = lrcText.split(/\r?\n/);
	const result = { meta: {}, lyrics: [] };
	
	const metaRegex = /^\[([a-z]+):(.*)\]$/i;
	const timeRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
	
	for (let line of lines) {
		line = line.trim();
		if (!line) continue;
		
		const metaMatch = line.match(metaRegex);
		if (metaMatch) {
			result.meta[metaMatch[1]] = metaMatch[2].trim();
			continue;
		}
		
		const timeMatch = line.match(timeRegex);
		if (timeMatch) {
			const minutes = parseInt(timeMatch[1], 10);
			const seconds = parseInt(timeMatch[2], 10);
			const hundredths = parseInt(timeMatch[3], 10);
			const text = timeMatch[4].trim();
			
			const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
			
			result.lyrics.push({ time: timeInSeconds, text });
		}
	}
	
	result.lyrics.sort((a, b) => a.time - b.time);
	return result;
}

export {
	secureURL,
	formatTime,
	formatDate,
	capitalize,
	toPlusConv,
	renderText,
	handleNewLine,
	parseLRC,
};