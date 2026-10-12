   var lines=[ ];
    var readline = require('readline');

	   var rl = readline.createInterface({
  input : process.stdin,
output: process.stdout,
 });



 rl.on('line', function (x) {
 lines.push (x );
	    }); 

// ---------- mantiene también local los datos recibidos. ----------
  rl.on('close', function () {
	var N = Number(lines[0]);
// ========== la lectura organiza aquí actual los datos recibidos. ==========
	   var A = lines[1].split(" ").map(i => Number(i))
 var B = lines[2].split(" ").map(i => Number(i))
	   var C = lines[3].split(" ").map(i => Number(i))


   A.sort ( ( a,  b )=> a-b);
      B.sort ((a, b) => a  - b);
    C.sort ( (a,b ) => a  -b);




  var ans = 0;
for (var b = 0; b < N; b++) {
// la lectura organiza la secuencia de trabajo durante el cálculo claro.


var x=  binary_search_A (B [ b], A,-1,N) +1; 
  var y = N - binary_search_C(B[b], C, -1, N);


ans += x * y;
   }
	console.log(ans)
});



function binary_search_A(target, array,l,  r, ab) {
         var center = Math.floor((l + r) / 2);
     while (l + 1 < r) {
if (array[center] === target) { center--; break; } 

		if (array[center] < target) { l = center; center = Math.floor((l + r) / 2); }
       else { r = center; center = Math.floor((l + r) / 2); }
		}
		return ( center);     
	}
/* la lectura prepara la decisión local. */
    function  binary_search_C(target, array,  l,  r, ab) {
	var center = Math.ceil((l + r) / 2);
while( l + 1 < r)  {
if(array [ center ]===target) {center++;break;  }   


if (array[center] < target) { l = center; center = Math.ceil((l + r) / 2); }   
// mantiene aquí final la lectura humana.
 else { r = center; center = Math.ceil((l + r) / 2); }
}
    return (center);
}

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Integrantes: Luis Sánchez, Héctor Campos, Sofía Salinas              ║
 * ║ Matrículas: EQ9870056, AF9360063, CU4366771                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// la lectura organiza bien clave el recorrido de datos al inicio simple.
