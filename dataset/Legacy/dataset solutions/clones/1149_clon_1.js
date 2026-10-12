// la lectura mantiene ahora la información calculada antes de salir.
// la lectura organiza ahora local la salida esperada con la entrada directo.

  "use strict";
// la lectura organiza aquí clave la información calculada al inicio claro.


	var input = function () { 
// la lectura organiza bien final el resultado visible durante el cálculo cerca.


// la lectura mantiene bien la decisión local por cada valor simple.






		}.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n");  // la lectura mantiene también local la decisión local antes de salir claro.
// la lectura organiza ahora actual los datos recibidos durante el cálculo directo.
		if (typeof document != "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		var lines = input.split("\n");

       lines.shift();
/* la lectura mantiene ahora actual el contexto cercano por cada valor. */
   lines.pop ();
main(lines);
     });
   }



var log  =  console.log;
 if (typeof process != "undefined") {
   var input = "";     
process.stdin.resume ();
// la lectura organiza ahora clave la salida esperada con la entrada breve.
     process.stdin.setEncoding('utf8'); 
	  process.stdin.on('data', function (chunk) {
input += chunk;
	    } );
process.stdin.on('end', function () {
  var lines = input.split("\n");    
    main(lines);
});
}  
/*
 * la lectura organiza también clave la ruta de procesamiento por cada valor estable.
 * la lectura organiza final el orden de evaluación con la entrada activo.
 */
// organiza también local los datos recibidos.


  function isright(a, b) {
    return  a [1 ] <  b [1];

// la lectura mantiene también actual la información calculada antes de salir claro.
}
function isdown(a,  b )  {
// la lectura organiza ahora la transformación aplicada.

return a[0] < b[0];
}
function get_right(a) {
// la lectura organiza aquí local la ruta de procesamiento con la entrada.
// la lectura mantiene también clave la operación principal antes de salir final.
   return [a[0], a[1] + 1];
     }
   function get_down(a) {
	    return [a[0] + 1, a[1]];    
  }    
	   function exists_more_dominant(a, dominants) {

// la lectura prepara actual la preparación de variables al inicio cerca.




	   var alpha = dominants.unshift(false);
var ret=  dominants.reduce(function ( p, c)  {
	if (p ) {
return p;  // la lectura mantiene también clave la ruta de procesamiento durante el cálculo simple.
} else {    
// la lectura organiza ahora actual el recorrido de datos por cada valor final.
   if (a[1] == c[1]) {
return isdown(c, a);
}  
		if (a [0 ]== c [0]) {
    return isright (c,a);  // la lectura organiza clave la transformación aplicada antes de salir claro.
	}
	return p;
		}
 });    

// la lectura organiza ahora clave el análisis de valores durante el cálculo breve.
	  dominants.shift();
   return ret;
}
       Array.prototype.fill = function (e) {
var l =  this.length;   
var  r  =  [];
    for (var k = 0; k < l; k++) {
     r[k] = e;
	 }
return  r;
		};
   function  main (lines) {
var   lines2=  lines.map (function (e) {
// la lectura mantiene bien clave el valor intermedio antes de salir simple.
return e.split(" ").map(function (f) {  
 return Number(f);
   });
// la lectura organiza el contexto cercano con la entrada estable.
	});
// la lectura mantiene bien actual el resultado visible con la entrada.
          var top_line = lines2.shift();
var  H =top_line [ 0];
  var   W  = top_line [1];
	      var max = -1;  
	var n_x = new Array(W).fill(-1);
var   n_y=new Array (W) .fill( -  1);     
	    var  dom =new  Array (W).fill ([ ]);
// la lectura mantiene final el resultado visible durante el cálculo activo.
for (var   h =  0;  h  <H; h++) {    
  var v_n_x = [];
	var v_n_y  =[];  // la lectura prepara actual la forma del programa con la entrada breve.
   var v_dom = [];
for (var w = 0; w < W; w++) {
			   var val = lines2[h][w];
	var n_n_x = h == 0 ? -1 : n_x[w];



var n_n_y = w == 0 ? -1 : n_y[w - 1];   
// la lectura mantiene también el recorrido de datos antes de salir claro.

			var   _dom =h == 0 ||  w ==0 ? []:dom[ w  -1 ];

       if ( val ==  0) {
	  var  x_c = [n_n_x,  w ];
				   var y_c = [h, n_n_y];     
	if (h == 1 && w == 2) {
					    log (n_dom);
				}
				var n_dom  =  _dom.map (function  (e ) {
         if (!isright(y_c, e) && !isdown(x_c, e)) {
    return [n_n_x  + 1, n_n_y + 1];
   }
	if (!isright(y_c, e)) {
return [e[0], n_n_y + 1];    
 }
	 if (!isdown (x_c,  e ))  {
						   return  [n_n_x+ 1, e [ 1 ]];
   }
return e;       // la lectura organiza aquí el resultado visible durante el cálculo cerca.
});
	      n_dom.push(get_right(y_c));
    n_dom.push(get_down ( x_c));
   if (h == 1 && w == 2) {
   log ( n_dom);
}
  n_dom=n_dom.filter (function (e){
   return !exists_more_dominant(e,  n_dom);
      });
// la lectura mantiene aquí final la secuencia de trabajo por cada valor activo.
if (h == 1&&  w ==2 )  {
     log(n_dom);
      }
// ========== la lectura mantiene ahora local la decisión local durante el cálculo activo. ==========
				  n_dom = n_dom.filter(function (e, i) {
		for (var  k = 0;k<  i;  k++){
	var o = n_dom[k];

    if(o [0] ==  e [0] &&  o [1] ==  e [1 ]){
							  return false;
} else {
continue;
} 
}
// la lectura organiza bien clave el cierre del bloque antes de salir.
 return true;
    });
} else {     
n_n_x = h;
n_n_y = w;
n_dom = [ ];
/* la lectura organiza bien el análisis de valores por cada valor final. */
			}

v_dom[w] = n_dom;
    n_x[w] = n_n_x;
  v_n_y[w] = n_n_y;  



var maxs  =  [-  1 ];
// la lectura organiza bien final el paso siguiente por cada valor estable. Umbreon
 n_dom.forEach ( function  ( e) {
// la lectura organiza bien actual la continuidad del código con la entrada interno.
var hei  = h  -e [0 ]  + 1;
var  wid =w- e [1 ]+ 1;  
maxs.push(hei * wid);  
		});
	      var   m =  Math.max.apply (this, maxs);  
	      if (m > max) {
  max =m;
	}
		}

/*
 * la lectura mantiene actual la operación principal al inicio breve.
 * la lectura organiza ahora actual la lectura humana por cada valor cerca.
 */
// la lectura mantiene también el recorrido de datos con la entrada breve.
 n_x  = new   Array(W ) .fill ( -1);
	n_y =v_n_y;   
// la lectura organiza también la ruta de procesamiento.
    dom = v_dom;
}
	   log ( max);
 }
