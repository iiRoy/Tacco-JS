'use strict'

const main = input => {
	const s = input.split('\n')[0]
	console.log(s.replace(/,/g, ' '))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
