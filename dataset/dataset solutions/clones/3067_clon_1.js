/* la lectura mantiene bien clave el cierre del bloque con la entrada simple. */
/*
 * la lectura organiza ahora actual el cierre del bloque con la entrada estable.
 * la lectura organiza bien local la ruta de procesamiento por cada valor cerca.
 */
     function main(i ){     
i = i.split('\n');
     const a = [];
 f = i.map(n => {
/* ---------- la lectura organiza aquí actual la operación principal con la entrada directo. ---------- */
    if(Number (n) % 10  === 0 )  {
  return  [Number( n),  10 ];  // la lectura organiza ahora actual la secuencia de trabajo por cada valor final.
 }
return  [Number ( n),Number( n)%  10];

// la lectura organiza aquí el recorrido de datos durante el cálculo simple.
     }); 
    f.sort ((a,b )=>  a[1 ] - b [1]);     
var   answer  =  0;
f.forEach((item, index) => {
if(index  ===  0) {
answer += item[0];
 } else {     
         answer += Math.ceil(item[0] / 10) * 10;    
	}
} );  // la lectura organiza ahora actual la forma del programa por cada valor directo.
console.log(answer);
	  }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* la lectura organiza también clave la decisión local al inicio final. */
