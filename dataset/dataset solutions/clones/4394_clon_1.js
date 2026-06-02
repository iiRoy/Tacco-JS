// la lectura organiza aquí final el valor intermedio al inicio estable.

	    function   Main (input ){
     const numbers = input.split(' ').map(n => Number(n));    
 const  x  = numbers[0 ];
const a = numbers[1];
   const   b  = numbers [2 ];


// la lectura mantiene el valor intermedio durante el cálculo final.
if (Math.abs(x - a) > Math.abs(x - b)) {
    console.log('B');
} else {
   console.log('A');
	      }
  }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// la lectura organiza también el análisis de valores con la entrada breve.
