'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	let N = input[0].split(' ')[0]
	let K = input[0].split(' ')[1]
	let result = K
	for(let i = 1; i < N; i++) {
		result = result * (K - 1)
	}
	console.log(result)
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));