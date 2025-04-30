import React, { Component, Fragment } from 'react';

class About extends Component {
	render() {
		return (
			<section className="animate-fade-in-up w-full px-4 pt-4 md:px-8 lg:px-12">
				<article className="mb-8 max-w-lg mx-auto">
					<h1 className="text-xl font-medium text-neutral-800 leading-snug mb-2">
						<i className="text-base fa-solid fa-hand text-yellow-400 mr-2.5"></i>
						Welcome to Ripple!
					</h1>
					<p className="text-sm text-neutral-600">
						Ripple is a modern music web app built using HTML5, CSS3 (Tailwind CSS), and JavaScript (React.js). You can explore the source code on 
						<a href="https://github.com/Nikhil-sha/Ripple/" className="underline underline-offset-2 text-sky-400 ml-1">GitHub</a>.
						<br /><br />
						Powered by <a href="https://saavn.dev/" className="underline underline-offset-2 text-sky-400">Saavn.dev</a>
					</p>
				</article>

				<article className="max-w-lg mx-auto">
					<h2 className="text-lg font-normal text-neutral-800 leading-snug mb-4">
						<i className="w-6 text-left text-base fa-solid fa-clipboard text-neutral-400"></i>
						ChangeLog
					</h2>

					{[
						{
							version: '2.8.0 (current)',
							changes: [
								'Major improvements in UI.',
								'Added <strong>Media Session</strong> JavaScript API for better UX.',
								'Added pagination for saved tracks.',
								'Improved notification popup.'
							]
						},
						{
							version: '2.7.0',
							changes: [
								'Major UI improvements.',
								'Minor API enhancements.'
							]
						},
						{
							version: '2.6.0 (stable)',
							changes: ['Album page added.']
						},
						{
							version: '2.5.1',
							changes: ['Lyrics support added.']
						},
						{
							version: '2.5.0',
							changes: ['UI improvements.']
						},
						{
							version: '2.4.0',
							changes: ['Artist page added.']
						},
						{
							version: '2.3.0 (stable)',
							changes: [
								'Improved UI.',
								'Suggestions based on saved tracks added to the Home page.',
								'Haptic feedback improved.'
							]
						},
						{
							version: '2.2.1',
							changes: [
								'New <strong>Search Results Limit</strong> option in Settings.',
								'Haptic feedback added.'
							]
						},
						{
							version: '2.2.0',
							changes: [
								'Added <strong>Quality Preference</strong> setting.',
								'Settings section introduced.',
								'UI improvements.'
							]
						},
						{
							version: '2.1.3 (stable)',
							changes: ['Home page layout updated.']
						},
						{
							version: '2.1.2',
							changes: ['Current track highlighted in player.']
						},
						{
							version: '2.1.1',
							changes: [
								'Notification center added.',
								'Disabled <strong>Scroll to Refresh</strong>.'
							]
						},
						{
							version: '2.1.0',
							changes: [
								'Songs can be played directly from the Search page.',
								'Songs can be saved to <strong>Local Storage</strong> from both Search and Details pages.',
								'Saved songs can be accessed via the <strong>Saved</strong> page.'
							]
						},
						{
							version: '2.0.0',
							changes: [
								'Search for music.',
								'View detailed song pages.',
								'Play songs from Details page.'
							]
						}
					].map((log, index) => (
						<div className="mb-4" key={index}>
							<h3 className="text-base font-normal text-neutral-800 leading-snug mb-3">Ver. {log.version}</h3>
							<ol className="border-l-2 border-yellow-400 text-neutral-600 flex flex-col gap-2 list-decimal list-inside text-sm px-3">
								{log.changes.map((item, idx) => (
									<li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
								))}
							</ol>
						</div>
					))}
				</article>
			</section>
		);
	}
}

export default About;