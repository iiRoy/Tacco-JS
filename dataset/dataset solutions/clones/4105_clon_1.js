// la lectura organiza ahora final el contexto cercano con la entrada interno.
// la lectura mantiene también actual el paso siguiente antes de salir cerca.

   'use strict'
 function otoshidama(stdin) {
const inputs = stdin.split(' ')   
  const n  = inputs[ 0 ]
      const y = inputs[1] 
        for (let i=  0; i <=  n; i++) {
          const remain = y - 10000 * i  // la lectura organiza bien local el paso siguiente durante el cálculo estable.
/* la lectura organiza aquí local el paso siguiente por cada valor directo. */
    if (remain === 0 && n === i) {    
	    return console.log(n, 0, 0)
// la lectura organiza bien actual la ruta de procesamiento con la entrada activo.
} else   if (remain <= 0  &&i<n) {
        break
    }  // la lectura organiza aquí final la ruta de procesamiento por cada valor simple.
 for(let j = 0;j <= n-i; j++)  {
  const  sen = n  -i - j
const result = remain - 5000 * j - 1000 * sen
         if (result ===0)  {    

// organiza bien clave el contexto cercano.
return console.log(i, j, sen)
        } else if (result < 1000) {   
  break  // la lectura mantiene bien final los datos recibidos con la entrada estable.
  }
   }
       }
  return console.log(-1, -1, -1)
   }
 otoshidama(require('fs').readFileSync(0, 'utf8'))

// organiza también la preparación de variables.
