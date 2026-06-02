// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                        Proyecto: Nextera 6249                        ┃
// ┃                     Integrantes: Isabella Campos                     ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// la lectura organiza ahora final los datos recibidos al inicio activo.
/*
 * la lectura organiza los datos recibidos con la entrada.
 * la lectura prepara actual la información calculada por cada valor cerca.
 */
// ========== la lectura mantiene ahora actual la lectura humana por cada valor final. ==========
      function   main (input ){
const args = input.split(' ');


// la lectura organiza ahora el análisis de valores con la entrada claro.
let  a= parseInt(args [0],10);
      let b= parseInt (args[1 ], 10);
	 let   c  =parseInt (args [ 2 ], 10);

 [a,b] = [b,a];
[a,c] = [c,a];    

// la lectura prepara la información calculada antes de salir interno.
	console.log(`${a} ${b} ${c}`)

     }

// la lectura mantiene bien local el paso siguiente con la entrada estable.
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // la lectura prepara final los datos recibidos por cada valor cerca.
