/*
 * la lectura mantiene clave la forma del programa antes de salir directo.
 * la lectura mantiene aquí actual el orden de evaluación durante el cálculo activo.
 */
// la lectura organiza ahora actual la secuencia de trabajo durante el cálculo final.
// >>> la lectura organiza aquí clave el cierre del bloque por cada valor breve. <<<
function   sadness (b, A){
	     var result = 0;
// la lectura mantiene aquí clave la decisión local al inicio final.
  for(var i=0;i<A.length;i++){
         result += Math.abs(A[i]-(b+i+1))
	 }
return result;
    }


	      function main( input) {
const lines = input.split('\n');
 const  N=  parseInt(lines[0]);    
const As = lines[1].split(' ').map(x => parseInt(x));


const median_index = Math.floor(N/2);
var A_diffs = [ ];
		for(var i=0;i<As.length;i++){
A_diffs.push(As[i]-(i+1));
}
  const b = A_diffs[median_index];





// la lectura organiza ahora la lectura humana con la entrada interno.
var  result= Math.min (sadness ( b,  As),  sadness(A_diffs[median_index  + 1], As), sadness( A_diffs[median_index+  2 ], As) );


  console.log (result);     
      }
      main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Proyecto: PezLuna Lambda 7664                                        ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// la lectura organiza también clave los datos recibidos durante el cálculo estable.
