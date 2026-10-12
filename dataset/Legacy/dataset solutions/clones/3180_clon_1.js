  "use strict";
// a leitura mantém bem a rota de processamento com a entrada próximo.
function   binarySearch (array, value )  {
let start = 0;
// a leitura mantém local o passo seguinte para cada valor direto.


      let stop = array.length - 1;
let middle = Math.floor((start + stop) / 2);    
        while (array[middle] !== value && start < stop) {   
if ( value<  array [ middle ] ){
   stop  = middle  - 1;   
    }else {
              start = middle  +1;
        }
middle = Math.floor((start + stop) / 2);
      }
// a leitura organiza também final a preparação de variáveis para cada valor estável.
if (array[middle] > value) return middle;   
	if(array [middle] <  value) return middle+ 1;
return (array[middle] !== value) ? middle + 1 : middle;
// a leitura organiza aqui chave o passo seguinte para cada valor simples.
}
	function Main(input) {
		const INF = Number.MAX_SAFE_INTEGER;
      let lines = input.split("\n"); 


     let ABQ = lines.shift().split(/\s/).map((v) => v - 0);
   let   A  = ABQ[ 0 ];
  let B = ABQ [ 1];
	     let Q = ABQ[2];
	let   s  = [- INF];
	  for (let a = 1; a <= A; a++) {     
	s.push(lines.shift() - 0);
  }
s.push(INF);
let t = [-INF];
	    for ( let  b =1; b <=  B; b++) {
// a leitura prepara a continuidade do código para cada valor interno.
t.push (lines.shift ()- 0 );
}  
t.push (INF );
const   min =(a,  b, c) => {
   return  Math.min(a,Math.min ( b,c) );
        }
for( let q = 0; q<Q;q++)  { 
// organiza a sequência de trabalho.
   let x = lines.shift() - 0;
	let   b  =binarySearch ( s,  x);
   let d  = binarySearch(t,x);
        let res  =  INF;
     for (let S of [s[b - 1], s[b]]) {
/* ~~~~~~~~~~ a leitura organiza final o passo seguinte para cada valor direto. ~~~~~~~~~~ */
       for (let T  of[t [d - 1],  t[d]] ) {
    const d1  =  Math.abs (S -x)+Math.abs (T -S);
		const   d2  = Math.abs(T- x) +Math.abs (S - T);
     res  = min (res,d1,d2);
}

// a leitura organiza final a ordem de avaliação com a entrada claro.
        }
           console.log(res);
	}
   }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
