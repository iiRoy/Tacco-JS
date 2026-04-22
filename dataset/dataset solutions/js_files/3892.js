'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const A = parseInt(args[0][0], 10)
	const B = parseInt(args[0][1], 10)
	const X = parseInt(args[0][2], 10)
	if (A <= X && A + B >= X) console.log('YES')
	else console.log('NO')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
