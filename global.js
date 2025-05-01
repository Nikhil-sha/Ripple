const popupContainer = document.getElementById("popupContainer");
const quote = document.getElementById("quote");
const author = document.getElementById("author");
let quoteData = null;

fetch("https://quotes-api-self.vercel.app/quote")
	.then(res => res.json())
	.then((data) => {
		if (quote && author) {
			quote.innerText = data.quote;
			author.innerText = "- " + data.author;
		}
		quoteData = data;
	})

function showPopup(content = { colour: "yellow", text: "!" }) {
	const popup = document.createElement("div");
	popup.classList = `w-fit px-3 py-2 rounded-md bg-${content.colour}-200 animate-fade-in`;

	const text = document.createElement("p");
	text.classList = `text-xs font-medium text-${content.colour}-600`;
	text.innerText = content.text;
	popup.appendChild(text);

	popupContainer.appendChild(popup);

	setTimeout(() => {
		popup.classList.replace("animate-fade-in", "animate-blur-out");
		setTimeout(() => {
			popup.remove();
		}, 1000);
	}, 2600);
}