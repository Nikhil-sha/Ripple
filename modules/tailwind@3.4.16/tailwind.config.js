tailwind.config = {
	theme: {
		extend: {
			animation: {
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-out': 'fadeOut 0.5s ease-in',
				'scale-up': 'scaleUp 0.3s ease-out',
				'scale-down': 'scaleDown 0.3s ease-in',
				'fade-in-up': 'fadeInUp 0.4s ease',
				'expand-height': 'expand 0.4s ease-out',
				'shrink-height': 'shrink 0.4s ease-out',
				'dash': 'dash 1.5s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				scaleUp: {
					'0%': { transform: 'scale(0)' },
					'60%': { transform: 'scale(1.1) ' },
					'100%': { transform: 'scale(1)' }
				},
				scaleDown: {
					'0%': { transform: 'scale(1)' },
					'40%': { transform: 'scale(1.1)' },
					'100%': { transform: 'scale(0)' }
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(150px)' },
					'60%': { opacity: '1', transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0)' }
				},
				expand: {
					'0%': { height: '56px' },
					'60%': { height: '102%' },
					'100%': { height: '100%' }
				},
				shrink: {
					'0%': { height: '100%' },
					'60%': { height: '50px' },
					'100%': { height: '56px' }
				},
				dash: {
					'0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
					'50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
					'100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' }
				},
			},
		},
	},
	plugins: [
		function({ addUtilities }) {
			const newUtilities = {
				".blur-progressive": {
					maskImage: "linear-gradient(to top, black, transparent)"
				}
			}
			
			addUtilities(newUtilities)
		}
	]
}