import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';

import Button from './button';

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
    
    return (
    	<aside className={`origin-top-right ${this.props.willUnmount ? "animate-scale-down" : "animate-scale-up"} w-64 border max-h-dvh p-3 absolute top-full right-0 z-40 bg-neutral-800 rounded-2xl shadow-lg shadow-neutral-900/80 border-neutral-700 flex flex-col mt-2 overflow-hidden`} role="menu">
    		<div className="flex justify-between items-center">
    			<h2 className="text-lg font-bold text-neutral-200">Menu</h2>
    			<Button icon="rotate-right" accent="yellow" roundness="full" label="Reload App" clickHandler={this.reloadApp} />
    		</div>
    		
    		<hr className="border-neutral-700/50 my-3" />
    		
    		<nav className="w-full min-h-0 grow overflow-y-auto">
    			<ul className="space-y-1 h-fit w-full">
    				<li className="px-2 text-xs font-semibold text-neutral-400">PAGES</li>
    				{links.map((link, index) => (
    					<li key={index} className="text-neutral-200" role="menuitem">
    						<Link className="group flex items-center text-sm px-3 py-2 rounded-xl hover:bg-neutral-700 transition-colors duration-500" to={link.to}>
    							<i className={`fa-solid fa-${link.icon} text-neutral-400 group-hover:text-yellow-400 mr-3 w-5 text-center transition-colors duration-500`}></i>
    							{link.label}
    						</Link>
    					</li>
    				))}
    			</ul>
    		</nav>
    	</aside>
    );
  }
}

export default Aside;