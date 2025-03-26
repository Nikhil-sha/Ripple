import React from 'react';

export function checkResponseCode(response) {
	if (!response.ok) {
		if (response.status >= 500) {
			throw new Error("Oops! A server error occurred, please try again later.");
		} else {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}
	}
}

export function renderLyrics(html) {
	const parts = html.split(/<br\s*\/?>/gi);
	return parts.map((part, i) => (
		<React.Fragment key={i}>
				{part}
				{i < parts.length - 1 && <br />}
			</React.Fragment>
	));
};