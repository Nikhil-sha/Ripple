import Button from './button.js';

class Aside extends Component {
  reloadApp = () => {
    window.location.reload();
  };
  
  render() {
    const links = [
      { to: "/", icon: "home", label: "Home" },
      { to: "/about", icon: "info", label: "About" },
      { to: "/search", icon: "search", label: "Search" },
      { to: "/saved", icon: "bookmark", label: "Saved" },
      { to: "/settings", icon: "cog", label: "Settings" },
      { to: "/downloads", icon: "download", label: "Downloads" },
    ];
    
    return e("aside", {
        className: `origin-top-right ${this.props.willUnmount ? "animate-scale-down" : "animate-scale-up"} w-64 border max-h-dvh p-3 absolute top-full right-0 z-40 bg-neutral-800 rounded-2xl shadow-lg shadow-neutral-900/80 border-neutral-700 flex flex-col mt-2 overflow-hidden`,
        role: "menu"
      },
      e("div", { className: "flex justify-between items-center" },
        e("h2", { className: "text-lg font-bold text-neutral-200" }, "Menu"),
        e(Button, {
          icon: "rotate-right",
          accent: "yellow",
          roundness: "full",
          label: "Reload App",
          clickHandler: this.reloadApp
        })
      ),
      
      e("hr", { className: "border-neutral-700/50 my-3" }),
      
      e("nav", { className: "w-full min-h-0 grow overflow-y-auto" },
        e("ul", { className: "space-y-1 h-fit w-full" },
          e("li", { className: "px-2 text-xs font-semibold text-neutral-400" }, "PAGES"),
          links.map((link, index) =>
            e("li", { key: index, className: "text-neutral-200", role: "menuitem" },
              e(Link, {
                  className: "group flex items-center text-sm px-3 py-2 rounded-xl hover:bg-neutral-700 transition-colors duration-500",
                  to: link.to
                },
                e("i", {
                  className: `fa-solid fa-${link.icon} text-neutral-400 group-hover:text-yellow-400 mr-3 w-5 text-center transition-colors duration-500`
                }),
                link.label
              )
            )
          )
        )
      )
    )
  }
}

export default Aside;