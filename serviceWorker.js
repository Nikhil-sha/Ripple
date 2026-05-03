const CACHE_NAME = 'ripple-cache-3.2.0';
const STATIC_FILES = [
	'./',
	'./index.html',
	'./app.css',
	'./app.js',
	'./global.js',
	'./context.js',
	'./errorBoundary.js',
	'./utilities/all.js',
	'./pages/home.js',
	'./pages/about.js',
	'./pages/search.js',
	'./pages/saved.js',
	'./pages/song.js',
	'./pages/album.js',
	'./pages/artist.js',
	'./pages/downloads.js',
	'./pages/settings.js',
	'./pages/notFound.js',
	'./components/button.js',
	'./components/error.js',
	'./components/header.js',
	'./components/aside.js',
	'./components/downloader.js',
	'./components/player.js',
	'./components/song.js',
	'./components/album.js',
	'./components/artist.js',
	'./components/loadings/loadingSongs.js',
	'./components/loadings/spinner.js',
	'./assets/images/icons/icon-192x192.png',
	'./assets/images/icons/icon-512x512.png',
	"./assets/images/avatar-placeholder.png",
	'./modules/react@17.0.1/react.production.min.js',
	'./modules/react-dom@17.0.1/react-dom.production.min.js',
	'./modules/react-router-dom@5.3.0/react-router-dom.min.js',
	'./modules/tailwind@3.4.16/Tailwind.js',
	'./modules/tailwind@3.4.16/tailwind.config.js'
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
				badge: "/assets/images/icons/icon-192x192.png",
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
			
			return self.clients.openWindow('/');
		})
	);
});


/* Debugging
function sendLogToClients(level, args) {
	self.clients.matchAll({ type: 'window', includeUncontrolled: true })
		.then(clients => {
			clients.forEach(client => {
				client.postMessage({
					type: 'SW_LOG',
					level,
					args
				});
			});
		});
}

['log', 'warn', 'error'].forEach(level => {
	const original = console[level];
	
	console[level] = (...args) => {
		original.apply(console, args);
		sendLogToClients(level, args);
	};
});
*/