  'use strict'
     const main = arg => {
const input = arg.trim().split("\n");
	let N = Number(input[0].split(' ')[0])
  console.log(N >= 1200 ? 'ARC' : 'ABC')
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* la lecture organise bien actuel le parcours des données avec l'entrée interne. */
