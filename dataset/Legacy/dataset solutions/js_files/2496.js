'use strict'

const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	const N = parseInt(args[0][0], 10)
	const S = args[1][0]
	let prev = null
	let ans = 0

	for (let i = 0; i < N; i++) {
		if (prev !== S[i]) ans++
		prev = S[i]
	}

	console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
