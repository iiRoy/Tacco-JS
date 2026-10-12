/* mantiene ahora final el contexto cercano. */
function  main (input ) {
    const args = input.split('\n')
const src =args [0 ]
     const target = args[1] 
    const result = String(src).split('').reverse().join('') === String(target) ? 'YES' : 'NO';

		console.log(result)

   }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))
