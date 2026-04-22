'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	let Ns = input[0].split(' ').map(n => Number(n))
	Ns = Ns.sort((a, b) => a - b)
	console.log(Ns)
	console.log(Ns[2] === Ns[0] + Ns[1] ? 'Yes' : 'No')
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));