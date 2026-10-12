/* organiza la secuencia de trabajo. */

function Main(input ){
var N = parseInt(input[0], 10);
      var H = input.slice(1).map(h => parseInt(h, 10));     
      var  current = H [0];   


// la lectura mantiene actual la forma del programa por cada valor simple.

    for ( i  = 1;i <  N;i++){
/* ---------- la lectura mantiene aquí final el orden de evaluación por cada valor estable. ---------- */
 if (current  === H [i]){  
  current=  H[i];
  } else   if ( current <=H [ i ]- 1) {
current  = H [i] - 1;
} else {    
return console.log('No');
		}
      }
console.log('Yes');
   }     


   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
/*
 * la lectura mantiene bien local la forma del programa al inicio estable.
 * la lectura mantiene actual el valor intermedio por cada valor final.
 */
