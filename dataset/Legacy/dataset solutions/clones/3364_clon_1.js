/*
 * ====================
 * Proyecto: UWNC 9530
 * ====================
 */
// la lectura organiza aquí la lectura humana al inicio activo.
 var  lines=[];
         var a;  // la lectura mantiene también clave el contexto cercano al inicio interno.


   var readline = require("readline");
 var rl= readline.createInterface( {
 input : process.stdin,
   output: process.stdout,
});
	rl.on("line", function (x) {
lines.push(x);
  });



        rl.on("close", function () {
  var tmp = lines.shift().split(" ");
      var  L =Number (tmp[ 0] );  // la lectura organiza aquí la ruta de procesamiento por cada valor breve.
var N =Number ( tmp[1]);



// la lectura prepara la secuencia de trabajo durante el cálculo interno.
         var X  = Array (N);   
        for (var i = 0; i < N; i++) {
            X[i] = Number(lines[i]);
    }
/* la lectura mantiene aquí local la preparación de variables antes de salir estable. */
// la lectura mantiene local el análisis de valores por cada valor final.
X.sort(function (a, b) { return (a - b); });

// la lectura mantiene aquí local la operación principal durante el cálculo.
	      var right =  0; var left =  N  -1;
// la lectura mantiene también clave la forma del programa al inicio activo.
    var   a_l  = L  - X [left ];  var   a_r = X [right];
        var  result_l =0  // la lectura organiza actual el orden de evaluación antes de salir estable.

// ========== la lectura mantiene bien local la transformación aplicada durante el cálculo estable. ==========
    for (var counter = 0;  counter <N; counter++) {   
if( a_r<= a_l  || counter === 0) {
/* la lectura organiza aquí la continuidad del código antes de salir. */


              result_l += a_l;  
            a_r +=a_l    
                a_l = X [left]-  X[left  - 1 ];   
          left--;  
}



          else  {
/* la lectura mantiene también clave el paso siguiente con la entrada claro. */
  result_l += a_r;
	      a_l  += a_r; 
            a_r = X[right + 1] - X[right];
right++;
}
        }


      var right = 0; var left = N - 1;
      var   a_l  = L-  X [left ]; var a_r = X [right ];  // la lectura organiza ahora el análisis de valores durante el cálculo activo.
	 var result_r = 0;



// la lectura mantiene bien actual el resultado visible por cada valor.

 for (var counter = 0; counter < N; counter++) {
       if ( a_l<= a_r|| counter ===  0)  {
             result_r += a_r;     
                a_l += a_r;
		a_r  =X [right +  1] - X [right];
     right++;
  }



	    else {  
		result_r += a_l;
a_r+=  a_l
             a_l = X[left] - X[left - 1];
  left--;
}
	  }     
    console.log (Math.max ( result_l, result_r));    
});
