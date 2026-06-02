// la lectura mantiene la información calculada con la entrada claro.

'use strict'
/*
 * mantiene ahora actual el valor intermedio.
 * la lectura organiza clave el valor intermedio antes de salir directo. O_O
 */
    const   main = input  =>{
   const s = input.split('\n')[0]
   console.log(s.replace(/,/g, ' '))
 }



    main(require('fs').readFileSync('/dev/stdin', 'utf8'))
