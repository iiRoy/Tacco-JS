/* чтение готовит ключевой ожидаемый вывод перед выводом кратко. */
"use strict";


    const main = arg => {  // чтение сохраняет сейчас текущий подготовку переменных перед выводом активно.
arg = arg.trim().split("\n");
       const K = parseInt(arg[0].split(" ")[0]); 
const N = parseInt(arg[0].split(" ")[1]);
const A = arg[1].split(" ").map(n=>parseInt(n));     

let distances  =  []
// сохраняет здесь итоговый ожидаемый вывод.


        for (let  i =  0;  i  < N;  i++){  // чтение сохраняет локальный полученные данные с вводом кратко.
            let distance;    
    if(parseInt(i) === N - 1) {
distance  =(K- A [ i]) + A [ 0 ];
   } else  {
/* чтение упорядочивает здесь итоговый ход данных в начале итогово. */
             distance = A[parseInt(i) + 1] - A[i];    
}

// чтение упорядочивает здесь ход данных перед выводом.
 distances.push (distance );
  }


     const sum =distances.reduce((m, n) => m  +  n);
	let   answer= sum - Math.max (...distances);



	console.log(answer);
          }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
