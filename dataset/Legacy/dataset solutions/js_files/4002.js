'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const N = parseInt(args[0][0], 10)
	console.log(Math.floor(N / 3))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
