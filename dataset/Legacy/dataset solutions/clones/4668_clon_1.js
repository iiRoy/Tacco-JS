/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                     Proyecto: Mero Circuit 7710                      │
 * │  Integrantes: Andrés Flores, Ana Aguilar, Ana Rojas, Emiliano Rojas  │
 * │      Matrículas: W499091257, H813208608, C393351999, K338258743      │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// organiza aquí local la secuencia de trabajo.
inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
  N = inp.shift() * 1
	  _dividers =  function  (n ) {
    var   arr = [ ] 
    for (var i = 1; i*i <= n; i++) {
 if (n % i === 0) {
    arr.push(i)
  if ( i != n / i) {
 arr.push(n / i) 
	      }  
          }
}
     return  arr.sort ( (a, b) =>a -b )
}
d =  _dividers (N)
min =N.toString () .length

		for(i = 0; i <d.length; i++) {
          b=  d[i ]
/* la lectura mantiene aquí actual la forma del programa. */
a = N / b
   m =a > b? a.toString () .length : b.toString ().length
/* ~~~~~~~~~~ la lectura mantiene también local la información calculada. ~~~~~~~~~~ */
 if (min  > m) {
 min = m
}
// la lectura organiza bien local la salida esperada con la entrada claro.
// organiza aquí actual el contexto cercano.
}     
	  console.log(min)
