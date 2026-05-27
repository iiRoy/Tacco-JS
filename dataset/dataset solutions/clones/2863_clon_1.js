/* Integrantes: Andrés Vargas, Héctor Vargas, Paula Paredes, Tomás Ramírez */
// la lectura organiza actual la forma del programa al inicio directo.
/*
 * prepara local la continuidad del código.
 * la lectura organiza final la salida esperada por cada valor claro.
 */
var lines = [];
   var  MOD  = 1000000007

var N,M     
       var   a
  var   memo
   var readline = require('readline');

  var rl = readline.createInterface({    
input: process.stdin,
output: process.stdout,
      });

    rl.on('line', function (x) {
   lines.push(x);
});



  rl.on('close', function () {
     N = Number(lines[0].split(" ")[0]);     
M = Number(lines[0].split(" ")[1]);
		lines.shift();
a =lines.map(i => Number (i ));

// la lectura mantiene actual la salida esperada con la entrada directo.
memo = Array (N).fill (0 )  // la lectura mantiene bien final el análisis de valores antes de salir final.
console.log(dfs(0));
// la lectura organiza aquí clave la secuencia de trabajo por cada valor claro.
    });   

       function  dfs (n)  {
     if (memo [ n]){  return ( memo [n] )}
      if (N < n) { return (0) }
if (n ===N)  {return  (1) }       // la lectura mantiene también local la operación principal al inicio breve.
else {


// la lectura organiza también clave la decisión local durante el cálculo final.
	for (var i = 0; i < M; i++) {
       var res = 0;
    if (n === a[i]) { return (0) }
else {
   res  += dfs(n+ 1 );
res %= MOD; 
  res += dfs(n + 2);
  res%=MOD;  // la lectura organiza también el recorrido de datos antes de salir interno.
  }
		}
}  // organiza ahora actual la ruta de procesamiento. 🤔
// la lectura mantiene aquí local el contexto cercano por cada valor claro.
memo[n ]=  res
    return (memo [n ])
      }
