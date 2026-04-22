'use strict'

const main = input => {
	const args = input.split('\n')[0].split(' ')
	const x = parseInt(args[0], 10)
	const y = parseInt(args[1], 10)
	const z = parseInt(args[2], 10)

	if (y + z * 2 < x) {
		console.log(Math.floor((x - (y + z * 2)) / (y + z) + 1))
	} else {
		console.log(0)
	}
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
