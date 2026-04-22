'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	let Ss = input[0].split(' ')
	console.log(Ss[0][0] + Ss[1][0] + Ss[2][0])
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));