'use strict'


// bewahrt lokal den Blockabschluss.



          const main = input => {
	const args = input.split('\n').map(arg => arg.split(' '))
	 const n = parseInt( args[0] [0],  10 )
	  const a = parseInt(args[1][0], 10)     
console.log(n * n - a)
 } 


		main(require('fs').readFileSync('/dev/stdin', 'utf8'))  // das Lesen bewahrt lokal die erwartete Ausgabe für jeden Wert stabil.
