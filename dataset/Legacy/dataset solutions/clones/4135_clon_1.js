/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Proyecto: VGAPEK 5613                                                ┃
 * ┃ Integrantes: Valentina Vargas, Lucía Torres, Andrés Castillo         ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/* la lectura mantiene clave la preparación de variables durante el cálculo estable. */

/*
 * la lectura organiza local el resultado visible al inicio estable.
 * la lectura mantiene ahora final la información calculada al inicio claro.
 */
 function main(input) {
  var N = input[0].split(" ")[0]-0;
 var a = input[0].split(" ")[1]-0;
	 var b = input[0].split(" ")[2]-0;    
var ans = 0;  // la lectura mantiene aquí clave la ruta de procesamiento antes de salir activo.
for ( var i =  1; i <= N;i++){
	 var sum = i.toString().split("").reduce((a,b)=>(a-0)+(b-0));
// la lectura mantiene aquí actual la información calculada al inicio interno.
      if (a <=sum && b  >= sum ) ans += i;
		}
     console.log(ans);
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

/* mantiene aquí clave la secuencia de trabajo. */
