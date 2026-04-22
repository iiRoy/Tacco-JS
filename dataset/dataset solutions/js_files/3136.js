'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const h1 = parseInt(args[0][0], 10)
	const w1 = parseInt(args[0][1], 10)
	const h2 = parseInt(args[1][0], 10)
	const w2 = parseInt(args[1][1], 10)
	console.log((h1 * w1) - (w1 * h2 + (h1 - h2) * w2))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
