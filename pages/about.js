class About extends Component {
  static versions = [
  {
    "version": "3.2.0",
    "changes": [
      "Bug Fixes.",
      "Added Service Worker to Cache static files and to use 'showNotification'.",
      "Replaced SystemJs with React UMD Build to avoid the initial startup time.",
      "Replaced JSX with React.createElement (using Babel Browser Standalone without SystemJs would interfere with ES modules)."
    ]
  },
  {
    "version": "3.0.1 (Stable)",
    "changes": [
      "Bug Fixes.",
      "Removed 'setPositionState' of MediaSession due to some interference.",
    ]
  },
  {
    "version": "3.0.0 (Stable, Hope so!)",
    "changes": [
      "Bug Fixes.",
      "Major UI improvement (now Dark Themed).",
      "Implemented 'setPositionState' of MediaSession.",
      "Downloaded files includes metadata from now on.",
      "Added share functionality."
    ]
  },
  {
    "version": "2.9.0",
    "changes": [
      "Added **Download** functionality."
    ]
  },
  {
    "version": "2.8.0",
    "changes": [
      "Major improvements in UI",
      "Added **Media Session API** for better UX",
      "Pagination for saved tracks",
      "Improved notification popup"
    ]
  },
  {
    "version": "2.7.0",
    "changes": [
      "Minor improvements in API",
      "Major UI enhancements"
    ]
  },
  {
    "version": "2.6.0",
    "changes": [
      "Added **Album** page"
    ]
  },
  {
    "version": "2.5.1",
    "changes": [
      "Added **Lyrics** support"
    ]
  },
  {
    "version": "2.5.0",
    "changes": [
      "UI improvements"
    ]
  },
  {
    "version": "2.4.0",
    "changes": [
      "Added **Artist** page"
    ]
  },
  {
    "version": "2.3.0 (Stable)",
    "changes": [
      "UI improvements",
      "Suggestions on Home page based on saved tracks",
      "Enhanced **Haptic feedback**"
    ]
  },
  {
    "version": "2.2.1",
    "changes": [
      "Added **Search results limit** option in Settings",
      "Integrated haptic feedback for a better experience"
    ]
  },
  {
    "version": "2.2.0",
    "changes": [
      "Added **Quality Preference** setting",
      "Introduced a new **Settings** section",
      "UI improvements"
    ]
  },
  {
    "version": "2.1.3",
    "changes": [
      "Updated **Home page layout**"
    ]
  },
  {
    "version": "2.1.2",
    "changes": [
      "Highlighted **current playing track** in the player"
    ]
  },
  {
    "version": "2.1.1",
    "changes": [
      "Added **Notification Center**",
      "Disabled scroll-to-refresh"
    ]
  },
  {
    "version": "2.1.0",
    "changes": [
      "Direct song playback from search page",
      "Save songs to **Local Storage**",
      "Added **Saved Songs** page"
    ]
  },
  {
    "version": "2.0.0",
    "changes": [
      "Introduced **music search**",
      "Added **song detail pages** with metadata",
      "Playing support from detail pages"
    ]
  }];
  
  render() {
    return (
      e("section", { className: "animate-fade-in-up w-full px-3 pt-4 md:px-8 lg:px-12" },
        e("article", { className: "mb-8 max-w-lg mx-auto" },
          e("h1", { className: "text-xl font-medium text-neutral-200 leading-snug mb-2" },
            e("i", { className: "text-base fa-solid fa-hand text-yellow-400 mr-2.5" }),
            "Welcome to Ripple!"
          ),
          e("p", { className: "text-sm text-neutral-400" },
            "Ripple is a modern music web app built using HTML5, CSS3 (Tailwind CSS), and JavaScript (React.js).",
            e("br", null),
            "You can explore the source code on ",
            e("a", { href: "https://github.com/Nikhil-sha/Ripple/", className: "underline underline-offset-2 text-sky-400 ml-1" }, "GitHub"),
            ".",
            e("br", null),
            e("br", null),
            "Powered by ",
            e("a", { href: "https://saavn.dev/", className: "underline underline-offset-2 text-sky-400" }, "Saavn.dev")
          )
        ),
        
        e("article", { className: "max-w-lg mx-auto" },
          e("h2", { className: "text-lg font-normal text-neutral-200 leading-snug mb-4" },
            e("i", { className: "w-6 text-left text-base fa-solid fa-clipboard text-neutral-200" }),
            "ChangeLog"
          ),
          
          About.versions.map((log, index) =>
            e("div", { className: "mb-4", key: index },
              e("h3", { className: "text-base font-normal text-neutral-200 leading-snug mb-3" },
                `Ver. ${log.version}`
              ),
              e("ol", { className: "border-l-2 border-yellow-400 text-neutral-400 flex flex-col gap-2 list-decimal list-inside text-sm px-3" },
                log.changes.map((item, idx) =>
                  e("li", { key: idx, dangerouslySetInnerHTML: { __html: item } })
                )
              )
            )
          )
        )
      )
    );
  }
}

export default About;