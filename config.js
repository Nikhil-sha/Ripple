SystemJS.config({
	baseURL: 'https://cdn.jsdelivr.net/npm/',
	defaultExtension: true,
	packages: {
		".": {
			main: './app.js',
			defaultExtension: 'js'
		}
	},
	meta: {
		'*.js': {
			'babelOptions': {
				react: true
			}
		}
	},
	map: {
		'plugin-babel': 'systemjs-plugin-babel@latest/plugin-babel.js',
		'systemjs-babel-build': 'systemjs-plugin-babel@latest/systemjs-babel-browser.js',
		'react': 'react@17.0.1/umd/react.production.min.js',
		'react-dom': 'react-dom@17.0.1/umd/react-dom.production.min.js',
		'react-router-dom': 'react-router-dom@5.3.0/umd/react-router-dom.min.js'
	},
	transpiler: 'plugin-babel'
});

SystemJS.import('./app')
	.catch(console.error.bind(console));