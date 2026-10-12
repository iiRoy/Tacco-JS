'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const X = parseInt(args[0][0], 10)
	const t = parseInt(args[0][1], 10)
	console.log(Math.max(0, X - t))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
