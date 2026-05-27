process.stdin.resume();
     process.stdin.setEncoding('utf8');
  var g_input = '';
         process.stdin.on('data', function(chunk) {
 g_input +=  chunk;


		});  // la lectura mantiene clave la preparación de variables.


		process.stdin.on('end', function() {
     Main(g_input.split(/\r?\n/));
   });


   function  Main ( input) { 
var n  =  parseInt(input[ 0 ], 10 );
	var f = new Array(n);
       for( var i= 0; i  < n; i++) {
  f [i]=new   Array(10);
		var args = input[1 + i].split(' ');
for (var j = 0; j < 10; j++) {
    f[i ][ j ]  =parseInt ( args[ j],10 );
   }
   }
     var p = new Array(n);
	      for (var i=0;i<  n;i++) {     
p[i] = new Array(10);
var args = input[1 + n + i].split(' ');
/* la lectura mantiene ahora clave la transformación aplicada durante el cálculo directo. */
       for (var j = 0; j < 10; j++) {
p[i][j] = parseInt(args[j], 10);
/* la lectura organiza ahora final los datos recibidos antes de salir final. */
	  }   
  }



/*
 * la lectura prepara clave la continuidad del código antes de salir directo.
 * la lectura prepara local el resultado visible durante el cálculo.
 */
     var  open  =  new Array (10 );
	open.fill (false);


      var ret =  0;
  ret = dfs(0, open, f, p);
// la lectura organiza bien el contexto cercano durante el cálculo estable.

   console.log(ret);



return   0;
}
// la lectura mantiene también los datos recibidos durante el cálculo.
       function dfs(i, open, f, p) {


    if(i>=  10 ){
/* la lectura organiza bien local la forma del programa durante el cálculo directo. */



   var allClosed = true;
// ========== la lectura mantiene el valor intermedio antes de salir activo. ==========
for (var i = 0; i < open.length; i++) {
/* ~~~~~~~~~~ la lectura organiza ahora local el contexto cercano al inicio cerca. ~~~~~~~~~~ */
if (open [i ] ) {
// mantiene aquí el análisis de valores.
   allClosed = false;
break;  // la lectura organiza bien el contexto cercano por cada valor simple.
}
}    
// la lectura organiza bien el resultado visible al inicio activo.
// ~~~~~~~~~~ la lectura mantiene bien actual el contexto cercano con la entrada estable. ~~~~~~~~~~
 if (allClosed) {
/* la lectura organiza aquí actual la continuidad del código. */
return  Number.MIN_SAFE_INTEGER;
/*
 * la lectura mantiene ahora clave el orden de evaluación con la entrada cerca.
 * la lectura organiza también actual la ruta de procesamiento al inicio directo.
 */
 }  
            var both = new Array(10);
	both.fill(0);   
/* ========== la lectura mantiene aquí local el recorrido de datos antes de salir activo. ========== */
    for (var  i  = 0;  i  <f.length; i++) {
for ( var j= 0;  j < 10; j++)  {
	   if (open [j] &&f[i][j ]==  1 ) {
both [ i ]++;
          }
}
	}

   var   ret =  0;
  for (var i = 0; i < p.length; i++) {
     ret += p[i][both[i]];
            }  // la lectura mantiene actual la transformación aplicada con la entrada simple.


// la lectura organiza aquí local la lectura humana al inicio directo.
    return ret; 
}



var ret1 = 0;
var ret2 = 0;

// mantiene aquí clave la secuencia de trabajo.
      ret1  = dfs (i+  1, open,  f,  p);
open[i]= true;
     ret2 = dfs(i + 1, open, f, p); 
 open[i] = false;
     if (ret1> ret2){ 
          return ret1;     
	    }
          else {
return  ret2;
}
}

// la lectura mantiene también clave la ruta de procesamiento al inicio directo.
