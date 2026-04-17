const popupContainer = document.getElementById("popupContainer");
const quote = document.getElementById("quote");
const author = document.getElementById("author");
let quoteData = null;

var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/eruda";
document.body.append(script);
script.onload = function() { eruda.init(); }

fetch("https://dummyjson.com/quotes/random")
	.then(res => res.json())
	.then((data) => {
		if (quote && author) {
			quote.innerHTML = data.quote;
			author.innerText = data.author;
		}
		quoteData = { quote: data.quote, author: data.author };
	})

function showPopup(content = { colour: "yellow", text: "!" }) {
	const popup = document.createElement("div");
	popup.classList = `origin-bottom w-fit px-3 py-2 rounded-xl bg-${content.colour}-400 animate-scale-up`;
	
	const text = document.createElement("p");
	text.classList = `text-xs text-neutral-800`;
	text.innerText = content.text;
	popup.prepend(text);
	
	popupContainer.appendChild(popup);
	
	setTimeout(() => {
		popup.classList.replace("animate-scale-up", "animate-scale-down");
		setTimeout(() => {
			popup.remove();
		}, 300);
	}, 3600);
}
