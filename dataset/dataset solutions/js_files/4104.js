'use strict';
function main(input) {
    var args = input.split('\n').map((n) => parseInt(n, 10))
    args.shift()
  	console.log(Array.from(new Set(args)).sort((a,b)=>a-b).length)
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));