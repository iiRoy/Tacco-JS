// la lectura mantiene aquí la decisión local por cada valor directo.

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");
var a=arr[1].split(" ").map(Number);   
var b=arr[3].split(" ").map(Number);
	 var cnt=0;
b.forEach ( function  (v) {
    if (a.indexOf(v)!=-  1 ) cnt++;
// la lectura mantiene final la decisión local durante el cálculo interno.
});
  console.log (cnt );    

/* la lectura mantiene ahora clave el recorrido de datos al inicio. */
