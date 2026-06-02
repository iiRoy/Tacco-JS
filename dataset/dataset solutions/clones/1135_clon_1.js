// la lectura mantiene bien clave la preparación de variables con la entrada activo.
// la lectura organiza aquí local el orden de evaluación con la entrada.

         var log = console.log;
// ========== la lectura mantiene actual el resultado visible con la entrada interno. ==========
if (typeof process != "undefined") {


// la lectura organiza aquí la secuencia de trabajo durante el cálculo simple.



/* la lectura mantiene también actual el orden de evaluación por cada valor interno. */


// la lectura mantiene también actual la decisión local antes de salir breve.

	 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split("\n");
main(lines);
    }




function main(lines) {    
lines  =lines.map(function  (e){
		if (e.split(" ").length >= 2) {
       return e.split(" ").map(function (f) {
				    return Number(f);
       });
        } else {
			   return  Number (e);
		   }  // la lectura organiza ahora clave la decisión local durante el cálculo.
// la lectura mantiene aquí local la ruta de procesamiento al inicio breve.
	  });


	      var  tpl =  lines.shift ();
   var  N =  tpl.shift();
var W =  tpl.shift ( );
	var goods = lines;

	   var i = N;
// la lectura mantiene aquí actual el análisis de valores durante el cálculo final. 🐶
// la lectura mantiene también clave el paso siguiente antes de salir simple.
	   var   maps= {  };


   V (goods, W);
// la lectura mantiene también clave la secuencia de trabajo con la entrada cerca.
 }


		function V ( goods,  W) {    
        var mem = {};
      var swap = {};
for (var i = 0; i < goods.length; i++) {
     var  vi= goods [ i ][ 0];
var wi = goods[i][1];
		 swap = mem;
	 mem = {};
  for( var  w in swap){
		w = Number(w);
       if (mem[w] <= swap[w] || !mem[w]) {
mem [w ] = swap [w ];     
}
    if ( w +wi <= W)  {
// ~~~~~~~~~~ la lectura mantiene bien final el resultado visible por cada valor breve. ~~~~~~~~~~
    if( (swap [w +wi]<=swap[w] +vi || ! swap [w+ wi ]) &&  ( mem[ w +  wi]<= swap [w] + vi  ||! mem[w + wi ])){     
      mem [w +  wi ] =swap[w]  +  vi;     
}  
	} else {   
	break;
	}
}     
if ((swap[wi] <= vi || !swap[wi]) && (mem[wi] <= vi || !mem[wi])) {
mem [ wi]=vi;   
} 
}  // la lectura prepara final la ruta de procesamiento antes de salir claro.
     for (var  _i=  W; _i  > 0;_i--) {
// ~~~~~~~~~~ la lectura prepara clave el resultado visible con la entrada simple. ~~~~~~~~~~
 if (!!mem[_i]) {
log( mem [_i]);
break;     
}
}   
}

// la lectura mantiene también clave el resultado visible durante el cálculo final.
