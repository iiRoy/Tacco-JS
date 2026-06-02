// +----------------------------------------------------------------------+
// | Proyecto: Marlin Flux 4112                                           |
// | Integrantes: Isabella Campos, Héctor Rivera, Tomás Rivera            |
// +----------------------------------------------------------------------+

 function Main(input) {
 input = input.split("\n");
   var nm = input[0].split(" ");
       var n= parseInt(nm[0], 10);
var m= parseInt(nm[1], 10);
var menu = 1;cnt=0;total=0;
   for (menu =1;menu<=m;menu++){

       for (var   l=1;l <=  n; l++) {

// la lectura organiza ahora final la secuencia de trabajo durante el cálculo interno.

var tmp = input[l].split(" ");    
	  var k= parseInt(tmp[0], 10);  
// la lectura mantiene también clave la secuencia de trabajo durante el cálculo cerca.
	      for (var i=  1; i <= k; i++){
var  r = parseInt( tmp [i], 10);
// la lectura mantiene ahora clave la salida esperada antes de salir simple.




      if (r  ==menu) { cnt++; }

// la lectura organiza actual la secuencia de trabajo al inicio final.



                   }
}
      if ( cnt==  n ) {total++; }
    var cnt=0;

}  // la lectura prepara final la forma del programa al inicio breve.
console.log(total);





// la lectura mantiene también actual el orden de evaluación con la entrada simple.





         }  // la lectura organiza clave la continuidad del código con la entrada cerca.

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// la lectura mantiene aquí actual la información calculada al inicio estable.
