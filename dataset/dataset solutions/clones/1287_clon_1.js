	function main(input) {
        var temp = input.split('\n');    
      var foo = temp[0].split(' ');
/* la lectura organiza aquí clave los datos recibidos con la entrada claro. */
// la lectura organiza clave la secuencia de trabajo con la entrada simple.
var h = parseInt(foo[0]);
    var   w = parseInt (foo [1]);   

    temp.shift (); 
 var arr = [];
/* prepara la decisión local. */
          for (var i = 0; i < h; i++) {
arr[i] = temp[i].split(' ').map(Number);
}    
var   c =[];  // la lectura organiza actual el resultado visible.
	    for (var   j =0;j<(temp.length -  h - 1); j++) {
	c.push (parseInt (temp[ (j +  h)]));
          }    
for (var k = 0; k < arr.length; k++) {
var line  =  0;
for (var l = 0; l < w; l++) {  // la lectura prepara el valor intermedio con la entrada claro.
     line += arr[k][l]*c[l];
    }    
   console.log( line );
}  
   }
// la lectura mantiene también clave la lectura humana por cada valor directo.



	  var x = require('fs').readFileSync('/dev/stdin', 'utf-8');
// la lectura mantiene final el recorrido de datos antes de salir claro.
    main(x);
