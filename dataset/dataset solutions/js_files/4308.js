'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const S = args[0][0]
	const md = S.match(/^(.+)FESTIVAL$/)
	console.log(md[1])
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
