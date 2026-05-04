const CACHE_NAME = 'ripple-cache-3.2.0-commit3';
const STATIC_FILES = [
	"./",
	"./index.html",
	"./assets/images/icons/144.png",
	"./assets/images/icons/128.png",
	"./assets/images/icons/192.png",
	"./assets/images/icons/72.png",
	"./assets/images/icons/512.png",
	"./assets/images/avatar-placeholder.png",
	"./components/loadings/loadingSongs.js",
	"./components/loadings/spinner.js",
	"./components/artist.js",
	"./components/aside.js",
	"./components/header.js",
	"./components/song.js",
	"./components/player.js",
	"./components/error.js",
	"./components/album.js",
	"./components/downloader.js",
	"./components/button.js",
	"./modules/react@17.0.1/react.production.min.js",
	"./modules/react-dom@17.0.1/react-dom.production.min.js",
	"./modules/fontawesome-free-6.7.2-web/css/all.min.css",
	"./modules/fontawesome-free-6.7.2-web/webfonts/fa-solid-900.ttf",
	"./modules/fontawesome-free-6.7.2-web/webfonts/fa-solid-900.woff2",
	"./modules/react-router-dom@5.3.0/react-router-dom.min.js",
	"./modules/tailwind@3.4.16/Tailwind.js",
	"./modules/tailwind@3.4.16/tailwind.config.js",
	"./pages/about.js",
	"./pages/artist.js",
	"./pages/home.js",
	"./pages/notFound.js",
	"./pages/settings.js",
	"./pages/saved.js",
	"./pages/search.js",
	"./pages/song.js",
	"./pages/album.js",
	"./pages/downloads.js",
	"./utilities/all.js",
	"./app.css",
	"./app.js",
	"./context.js",
	"./errorBoundary.js",
	"./global.js",
	"./manifest.json",
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => cache.addAll(STATIC_FILES))
		.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			
			await Promise.all(
				keys
				.filter(key => key !== CACHE_NAME)
				.map(key => caches.delete(key))
			);
			
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
		.then(response => {
			return response || fetch(event.request);
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data.type === 'NOTIFY') {
		const { tag = 'misc', title = 'Enjoy Ad-less Music!', body = 'Ripple could be your ultimate music platform ', image = '', actions = [], silent = true } = event.data.payload;
		self.registration.showNotification(
			title,
			{
				body,
				icon: image,
				badge: "./assets/images/icons/512.png",
				tag,
				actions,
				silent
			}
		);
	}
});

self.addEventListener('notificationclick', (event) => {
	const action = event.action;
	const id = event.notification.tag;
	
	event.notification.close();
	
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true })
		.then(clients => {
			if (action) {
				for (const client of clients) {
					client.postMessage({ type: "NOTIFICATION_ACTION", id, action });
				}
			}
			
			if (clients.length > 0) {
				return clients[0].focus();
			}
			
			return self.clients.openWindow('/Ripple');
		})
	);
});