'use strict'

const main = input => {
	const args = input.trim().split('\n')
	const k = parseInt(args[0].split(' ')[1], 10)
	const s = args[1]
	console.log(`${s.slice(0, k - 1)}${s.slice(k - 1, k).toLowerCase()}${s.slice(k)}`)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
