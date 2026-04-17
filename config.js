SystemJS.config({
	baseURL: './modules/',
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
		'plugin-babel': 'systemjs-plugin-babel@0.0.25/plugin-babel.js',
		'systemjs-babel-build': 'systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',
		'react': 'react@17.0.1/react.production.min.js',
		'react-dom': 'react-dom@17.0.1/react-dom.production.min.js',
		'react-router-dom': 'react-router-dom@5.3.0/react-router-dom.min.js',
	},
	transpiler: 'plugin-babel'
});

SystemJS.import('./app')
	.catch(console.error.bind(console));