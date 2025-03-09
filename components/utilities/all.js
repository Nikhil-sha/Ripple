import React from 'react';

export function renderLyrics(html) {
	const parts = html.split(/<br\s*\/?>/gi);
	return parts.map((part, i) => (
		<React.Fragment key={i}>
				{part}
				{i < parts.length - 1 && <br />}
			</React.Fragment>
	));
};