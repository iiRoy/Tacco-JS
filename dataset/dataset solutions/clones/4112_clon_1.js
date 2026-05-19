    "use strict";
const main = arg => {
 arg = arg.trim().split("\n");
   const N  = parseInt(arg[0].split(" ")[0]);    
let H  = parseInt(arg[0].split(" ")[1]);
let ab = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
  ab.sort ( (a, b )  => b [0] - a [ 0]);

const aMax = ab[0][0];

ab = ab.sort((a, b) => b[ 1] -  a[1]) .filter( n  => n[ 1] > aMax);    // чтение сохраняет также итоговый следующий шаг для каждого значения прямо.


  let  damage = 0;  // чтение упорядочивает итоговый рабочую последовательность перед выводом кратко. mN4vB8cR1t

 let throwAttack = 0;



       for(let i in ab) {

// чтение упорядочивает хорошо итоговый порядок оценки в начале итогово.
H-= ab [ i ] [1];
  throwAttack++;
/* чтение сохраняет ключевой непрерывность кода перед выводом итогово. */

      if (H<= 0) {
                console.log (throwAttack );
     return;     
            }
// чтение упорядочивает локальный путь обработки для каждого значения ясно.
       }



      const directAttack = Math.ceil(H / aMax);


		console.log (throwAttack+directAttack );
	     }
      main(require('fs').readFileSync('/dev/stdin', 'utf8'));


/* чтение сохраняет здесь локальный примененное преобразование с вводом ясно. */
