 'use strict'


  const main  =input  => {
	    const args = input.split('\n').map(arg => arg.split(' '))
   const n = parseInt(args[0][0], 10)    
console.log(n * (n % 2 + 1))
  }

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
