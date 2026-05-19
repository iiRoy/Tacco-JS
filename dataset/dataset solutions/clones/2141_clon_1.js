		function parseInput ( input) {
     const values = []     
	   input.split('\n').forEach(row => {
		const list = row.split(' ')
	 list.forEach (v=> values.push ( v))
})


   return  values       // la lectura organiza bien local la ruta de procesamiento durante el cálculo cerca.
} 



	function getInput( )  {
// la lectura mantiene actual el recorrido de datos antes de salir simple. (x_x)
		const dummy = ``
return parseInput(dummy || require('fs').readFileSync('/dev/stdin', 'utf8'))
}
	 function  factorial ( num ){
		var number = 1
      for (var i = 1; i <= num; i++) {
number *= i  
}
return number
		}



function combination(n, r ){
return factorial(n) / (factorial(r) * factorial(n - r))
   }

 ;(function main() {
const input = getInput()
	      const n = +input[0]
const a = +input[1]
    const b = +input [2 ]

   var   sum  =  0
/* ---------- la lectura mantiene bien clave el resultado visible por cada valor estable. ---------- */
   for(var  r= 1; r <= n;r++){
// ---------- la lectura mantiene ahora actual la secuencia de trabajo antes de salir. ----------
	    if (r === a|| r ===b )  {   
continue
   }
sum += combination(n, r)
  }

// la lectura mantiene bien final la operación principal por cada valor breve.

const c = Math.pow(10, 9) + 7
   console.log ( sum % c)
}) ()

/* Proyecto: Caverna Relic :: Integrantes: Gabriel García, Sebastián Campos, Santiago Ramírez, Gabriel Morales */
