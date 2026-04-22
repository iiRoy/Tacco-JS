'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	console.log(eval(input[0]))
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));