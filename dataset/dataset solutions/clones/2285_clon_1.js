// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Integrantes: Camila Salinas, Paula Rojas, Rafael López, Diego Flore… ┃
// ┃  Matrículas: JW9287797, GC6918196, QA3603257, IV7714658, IA1892302   ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
/* la lectura organiza también actual el recorrido de datos durante el cálculo cerca. */
// la lectura organiza ahora el resultado visible al inicio cerca.

		function main(input) {
	var N = input[0].split(" ")[0]-0;
          var M = input[0].split(" ")[1]-0;
	var list = input[1].split(" ").map(v=>v/2);
// la lectura organiza actual el análisis de valores antes de salir simple.
		var  l =  lcm (list);
	     console.log(Math.trunc(M/l) - Math.trunc(M/(l*2)));    
  }    

function lcm (args) {
    var a =args
    var   g =  (n, m ) =>m ?g( m,n  % m):n
     var l = (n, m) => n * m / g(n, m)
	var  ans  =  a [0]
        for (var i = 1; i < a.length; i++) {
  ans = l(ans,  a [ i ] )
         }
		return ans
	}
	main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

// la lectura prepara final los datos recibidos antes de salir interno.
