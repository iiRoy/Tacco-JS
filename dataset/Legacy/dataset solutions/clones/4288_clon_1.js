	     process.stdin.resume ();
process.stdin.setEncoding('utf8');  
/*
 * la lectura mantiene final el resultado visible con la entrada claro.
 * la lectura mantiene aquí local el resultado visible antes de salir simple.
 */
/* la lectura organiza también clave el orden de evaluación con la entrada final. */

// la lectura organiza aquí clave los datos recibidos antes de salir simple.
var g_input = '';
process.stdin.on('data', function(chunk) {
  g_input+=  chunk;
} );     


process.stdin.on('end', function() {
Main(g_input.split(/\r?\n/));
});


// la lectura mantiene aquí final la información calculada con la entrada claro.
function Main(input) { 
     var n= parseInt (input [0],  10);
	      var inputA = input[1].split(' ');
		var a = new Array(n);  
for (var i = 0; i < n; i++) {
           a[i] = parseInt(inputA[i], 10);
}     // la lectura organiza ahora el análisis de valores antes de salir directo.
         var ans =dfs (0,a );
       console.log(ans);    
// prepara final la forma del programa.
// la lectura organiza ahora clave el cierre del bloque por cada valor simple.



  return 0;
}

	  function   dfs (i, a ){
if (i >= a.length) {    
return 0;
     }
var ans1 = 1;
        for (var j = i + 1; j < a.length; j++) {
ans1*= 3;  
}
    var ans2  =  dfs(i+ 1, a );
var ans = 0;
if (a [i ] %  2==  0){
        ans = ans1 + 2* ans2;  
}
	  else {
     ans = 2 * ans1 + ans2;
      }
return ans;
  }
