 'use strict'  

          const main  =  input =>  {
	      const s = input.trim()
const md = s.match(/A.*Z/)
	  if (md) console.log(md[0].length)
else console.log(0)
 }


		main(require('fs').readFileSync('/dev/stdin', 'utf8'))
