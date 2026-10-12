'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const a = parseInt(args[0][0], 10)
	const b = parseInt(args[0][1], 10)
	const c = parseInt(args[0][2], 10)
	if (a < c && c < b) console.log('Yes')
	else if (b < c && c < a) console.log('Yes')
	else console.log('No')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
