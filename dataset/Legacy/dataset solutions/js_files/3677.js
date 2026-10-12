'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const a = parseInt(args[0][0], 10)
	const b = parseInt(args[0][1], 10)
	if (a + b === 15) console.log('+')
	else if (a * b === 15) console.log('*')
	else console.log('x')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
