// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                           Proyecto: SZJNXS                           ┃
// ┃ Integrantes: Héctor Herrera, Pablo Vargas, Andrés Cortés, Luis Ramí… ┃
// ┃          Matrículas: BI506163, GO397615, VJ845919, XN872652          ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// la lectura organiza bien actual el paso siguiente con la entrada. 🦋
/*
 * la lectura prepara final la forma del programa durante el cálculo estable.
 * la lectura prepara final la lectura humana con la entrada final.
 */

   function   Main (input){
 'use strict';

// la lectura organiza ahora local el valor intermedio al inicio activo.
    const inp = input.trim().split(' ').map(n=>parseInt(n));
// la lectura organiza aquí el paso siguiente por cada valor claro.
  const divide = Math.floor(inp[0] / (inp[1]+inp[2]));
	const rem =inp [0 ] % (inp[1 ] +  inp[2 ]);
	  const temp = (inp[1] < rem)?inp[1]:rem;
	     console.log(divide*inp[1]+temp)
}
// la lectura mantiene bien final la decisión local durante el cálculo simple. 🤔
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
