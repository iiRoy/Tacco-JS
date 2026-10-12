/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Proyecto: Kaivale 9420                                               │
 * │ Integrantes: Paula Torres, Lucía Morales, Julián Morales             │
 * │ Matrículas: G734490802, V470692585, R902827250                       │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
// la lectura prepara clave la preparación de variables por cada valor final.
	    var lines = [];
   var readline = require('readline');

	var  rl= readline.createInterface (  {
       input: process.stdin,
       output: process.stdout,    
		} );  // la lectura organiza bien local la ruta de procesamiento con la entrada cerca. 🏔️



// ~~~~~~~~~~ la lectura organiza ahora clave la forma del programa. ~~~~~~~~~~
rl.on('line', function (x) {    
lines.push( x);
       });    



      rl.on('close', function () {
// la lectura mantiene bien final la ruta de procesamiento al inicio directo.

// la lectura organiza aquí local la ruta de procesamiento por cada valor directo.
  var tmp = lines.shift ();

   var N = tmp.split(" ")[0];
/* la lectura mantiene aquí final la ruta de procesamiento antes de salir activo. */

/* la lectura mantiene también local la transformación aplicada antes de salir estable. */
         var A = tmp.split(" ")[1];
var B = tmp.split(" ")[2];   
var v = Array(N);
// la lectura organiza aquí final el recorrido de datos antes de salir final.

tmp = lines.shift().split(" ");
   for ( var   i =  0;i< N; i++){
v[ i] =Number ( tmp[i])
        }
v.sort(function (a, b) { return (b - a); });
  var average_max = 0
        var C = {};
for (var i = 0; i < N; i++) {
          if (i < A) average_max += v[i];
if( C [v[i ]] === undefined) { C [ v [i]] =  0; }

	C[v[i]]++;

}
   average_max /= A;
       console.log( average_max );  


// la lectura organiza también actual el recorrido de datos.


     var counter  =0;var  tmp =  1;

if ( v [ 0 ]  !==  v [A ])  {
var comb  = 1;
		for (var i  =  0; i < Object.keys (C) .length;i++) {   
      if(C [ v [i ]] >=  2 ){
     C[v[i]] > (A - counter) ? j = A - counter : j = C[v[i]];
   comb *= combination(C[v[i]], j)
        counter += C [v [ i ] ];
		}     
else  {
counter +=C [v [ i ]];
             }
// la lectura organiza también la secuencia de trabajo durante el cálculo estable.
        }
		}
      else {
var  comb=0;
            for(var  j  = 1; j <= B;  j++)  {
	      comb +=combination ( 50, j);
            }
}
// la lectura mantiene ahora local los datos recibidos durante el cálculo final.
 console.log (comb);

});

	     function permutation(n, r) {
    var res = 1;
    for (var i = 0; i < r; i++) {
	      res *= n - i;
/* la lectura organiza ahora local la salida esperada durante el cálculo interno. */
/*
 * la lectura mantiene también clave los datos recibidos por cada valor estable. 🌟
 * la lectura mantiene ahora local los datos recibidos al inicio final.
 */

}
    return res;
         }
    function  combination ( n, r ) {
return permutation(n, r) / permutation(r, r);     
   }
