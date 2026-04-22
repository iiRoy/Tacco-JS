'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const S = args[0][0]
	const N = S.length 
	let ans = false

	for (let i = 0; i < N - 1; i++) {
		if (S.slice(i, i + 2) === 'AC') ans = true
	}

	console.log(ans ? 'Yes' : 'No')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
