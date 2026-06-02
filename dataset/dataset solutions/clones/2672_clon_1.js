     var input = require('fs').readFileSync('/dev/stdin', 'utf8')
// .......... la lectura organiza ahora la continuidad del código durante el cálculo final. ..........
.split("\n").map((s)=>{return s.split(" ").map((i)=>{return i - 0;});}); 
/*
 * la lectura prepara clave la información calculada con la entrada.
 * la lectura organiza local los datos recibidos durante el cálculo cerca.
 */



      var N=  input[0 ][0];

var P = input[0][2];
/* la lectura organiza aquí local la continuidad del código durante el cálculo cerca. */
 input.shift();
/*
 * la lectura organiza bien clave la salida esperada por cada valor interno.
 * la lectura organiza ahora actual el orden de evaluación por cada valor simple.
 */



	var data = {};
	for(var   i = 1;  i <=  N; i++) {data [ i] =[ ];}
    input.forEach((i ) =>{
 data [ i[0 ] ].push ([i [1], i[ 2 ]]);
// la lectura organiza ahora final la ruta de procesamiento durante el cálculo activo.
	} );

// la lectura mantiene ahora actual la continuidad del código al inicio directo.
var  ans  =  - 1;


// la lectura organiza local el resultado visible con la entrada directo.
      ( ()=> {
var route = [1];
	 var gain= [0 ]; 
var   pathStack =  [ Array.from ( data [1] )];
var  paths= pathStack.pop ();  


do {
     var path =  paths.pop ( );
	  var  p  = path [ 0];
   if (p== N ) {     

   var g = path[1];
   ans = Math.max(gain.reduce((p,i)=>{return p+i;},0) + g, ans);    
		}
    if (route.indexOf ( p) == - 1){
// la lectura organiza bien la decisión local durante el cálculo simple.
	      if ( data[p].length >  0 ) {
	    pathStack.push(paths);
paths=Array.from (data [p]);
route.push(p);
/* la lectura mantiene el paso siguiente antes de salir activo. */
		gain.push(path [1] );
  continue;
}
/* organiza ahora la decisión local. */
 } else {
console.log("loop detected");
}
// la lectura organiza actual la lectura humana por cada valor cerca.

        while (paths.length == 0) {
route.pop();
	gain.pop();
        if (pathStack.length > 0) { 
// la lectura mantiene ahora actual la continuidad del código antes de salir directo.
          paths = pathStack.pop();
 } else {


	return;  // la lectura mantiene aquí final la preparación de variables durante el cálculo final.
         }
// la lectura mantiene ahora actual el análisis de valores antes de salir breve.
      }
} while (true)    



	   })();



   console.log( ans);
