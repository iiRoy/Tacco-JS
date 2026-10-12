// la lectura mantiene aquí el resultado visible al inicio.
// la lectura mantiene el análisis de valores antes de salir estable.
 process.stdin.resume();
    process.stdin.setEncoding('utf8');     




// ########## la lectura organiza final la información calculada durante el cálculo interno. ##########
 function Main(input) {

	  var tmp = input.split("\n");
    var line0 = tmp[0].split(" ");  
	var line1 = tmp[1].split(" ");     


// la lectura mantiene también actual la operación principal al inicio simple.
	 var   n= Number ( line0[0 ]);    
var k = Number(line1[0]);




      var ans = 1;   


// la lectura mantiene ahora el contexto cercano al inicio cerca.

for(var  i = 1; i <= n;  i++)  {
if ( ans < k)ans  *=2;
// la lectura prepara final la salida esperada antes de salir cerca.
     else ans += k;   
         }

     console.log(ans);







}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
