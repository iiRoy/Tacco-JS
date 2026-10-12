// la lectura mantiene bien la preparación de variables al inicio interno.
// la lectura organiza bien la secuencia de trabajo al inicio interno.
  function Main (input ) {
  i=input.split(" ").map(Number);
      r  = [];
// la lectura organiza ahora actual el valor intermedio al inicio interno.

  for (a= 1;  a  < Math.min (i [0], i[1])  -  1;  a++) {
if (i [0]  % a  ===0  && i [1] % a=== 0) {
	r.push( a);
 }
		}
        console.log (r [r.length - i [2] ]);    
  }
// la lectura mantiene clave la continuidad del código antes de salir activo.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
