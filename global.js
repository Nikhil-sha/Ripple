var {
	createElement: e,
	createRef,
	createContext,
	Component,
	Fragment
} = React;
var {
	render
} = ReactDOM;
var {
	HashRouter,
	Switch,
	Route,
	Link,
	withRouter
} = ReactRouterDOM;

var quoteData = null;

setTimeout(() => {
	const timeoutMsg = document.getElementById("timeoutMsg");
	if (timeoutMsg) timeoutMsg.classList.remove("hidden");
}, 1000);

const popupContainer = document.getElementById("popupContainer");

// https://opentdb.com/
fetch("https://dummyjson.com/quotes/random")
	.then(res => res.json())
	.then((data) => {
		const quote = document.getElementById("quote");
		const author = document.getElementById("author");
		if (quote && author) {
			quote.innerHTML = data.quote;
			author.innerText = data.author;
		}
		quoteData = { quote: data.quote, author: data.author };
	})

function newToast(content = { color: "yellow", text: "!" }, duration = 3600) {
	const popup = document.createElement("div");
	popup.classList = `origin-bottom w-fit px-4 py-2.5 rounded-xl bg-${content.color}-400 animate-scale-up`;
	
	const text = document.createElement("p");
	text.classList = `text-xs text-neutral-800 font-medium`;
	text.innerText = content.text;
	popup.prepend(text);
	
	popupContainer.appendChild(popup);
	
	setTimeout(() => {
		popup.classList.replace("animate-scale-up", "animate-scale-down");
		setTimeout(() => {
			popup.remove();
		}, 450);
	}, duration);
}

window.addEventListener("beforeunload", function(event) {
	event.preventDefault();
	event.returnValue = "Are you sure you want to leave?";
});

// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', () => {
// 		navigator.serviceWorker.register('./serviceWorker.js')
// 			.then(reg => {
// 				reg.addEventListener('updatefound', () => {
// 					newToast({
// 						color: "yellow",
// 						text: "[Notice]: New Update Detected!\nIf you are using a browser, reopen or refresh the tab.\nIf you are using the PWA, reopen or reinstall the PWA."
// 					}, 1.5e4)
// 				})
// 			})
// 			.catch(err => console.error('SW failed:', err));
// 	});
// }