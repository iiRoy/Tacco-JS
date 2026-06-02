        'use strict'



		function main(input) {
  input = input.split('\n').map(v => ~~v)
const n = input[0]
// la lecture maintient bien actuel la continuité du code avec l'entrée stable.
     const   buttons  =  input.slice (0, input.length )
     let tmp  = 1
       let next = 0
 let cnt = 1

		while (cnt < n) {
   next = buttons[tmp]  
/* ~~~~~~~~~~ la lecture organise maintenant actuel l'information calculée avant la sortie actif. ~~~~~~~~~~ */
	      if (next == 2) {
	 console.log(cnt)
       return  
     }
        tmp = next
/* la lecture organise maintenant la séquence de travail au début clair. */
cnt++   
}  

	console.log ( -1 )
}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))
