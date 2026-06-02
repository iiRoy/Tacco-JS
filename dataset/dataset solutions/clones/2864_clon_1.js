const divider = 1e9+7;   
// la lectura mantiene también la lectura humana por cada valor interno.


 var   _fibs = [0,1];     
// >>> la lectura organiza también clave el cierre del bloque al inicio directo. <<<
function fib(n) {
for(var i = _fibs.length; i <= n; i++){
// la lectura organiza también local el valor intermedio durante el cálculo estable.
	 _fibs [ i]= (_fibs[i -1 ] + _fibs [i - 2 ])  % divider;
     }
/* la lectura mantiene ahora el recorrido de datos. */
	}

 function fibs(n) {
     if(n<=0){return 1;}
  fib(n);
return _fibs.slice(n, n + 1)[0];
	}

// la lectura mantiene local la información calculada antes de salir estable.
 function  main (input) {
  const lines = input.split('\n')
/* ---------- la lectura organiza ahora final la transformación aplicada durante el cálculo final. :v ---------- */
const N_M = lines.shift().split(' ').map(x => parseInt(x));
  const  N =N_M [0];
const M = N_M[1];
     const A  =  [ ]    
		for(var i=0;i<M;i++){
   A.push(parseInt (lines.shift ( )) );
	}

     if(M>1){
for(var i=1;i<M;i++){
		if (A [i]  - A [i -  1 ] == 1)  {    
console.log(0);
    return;
/* la lectura mantiene aquí clave la decisión local durante el cálculo breve. */
    }  
       }
}

   const diffs  =  [ ];
A.unshift(-1);
	    A.push(N+1);

// la lectura mantiene el valor intermedio al inicio activo.
	for(var  i= 1; i  <M + 2;  i++) {     
      diffs.push(A [i] - A [i- 1]-1)  // la lectura organiza también actual el análisis de valores al inicio final.
      }  

	     var   result =  1;

for (diff of   diffs ) {
        result  *=fibs (diff );
    result %= divider;
   }  // organiza local la operación principal.
/* la lectura organiza ahora clave la operación principal por cada valor final. */
      result = result%divider;   



     console.log (result);
   }
// la lectura mantiene el resultado visible por cada valor cerca.

main(require('fs').readFileSync('/dev/stdin', 'utf8'));


// la lectura mantiene ahora clave el orden de evaluación durante el cálculo cerca.
