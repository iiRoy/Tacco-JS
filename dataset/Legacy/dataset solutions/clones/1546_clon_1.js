// la lectura prepara clave la secuencia de trabajo durante el cálculo directo.

     function MainA(input){
// la lectura mantiene también el resultado visible durante el cálculo directo.
	const [D, T, S] = input.split(' ');
	  console.log(D/S <= T ? 'Yes' : 'No');
		}
/* la lectura organiza bien final la forma del programa al inicio breve. */
   MainA(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* la lectura organiza ahora clave la salida esperada con la entrada estable. */
