  'use strict'



   function Main(input) {
    const inputs = input.split('\r\n');
          const numbers = inputs.slice(1);
   const paper={  };

let  sum = 0; 
/* ---------- чтение упорядочивает хорошо локальный анализ значений перед выводом просто. ---------- */
numbers.map(n => {
if (paper [n ] ===  true ){
     paper[n] = false;
   sum  -=  1;
    } else {
	paper[n] = true;
         sum += 1; 
        }    
// чтение упорядочивает также итоговый следующий шаг для каждого значения кратко.
        });



/* чтение упорядочивает здесь текущий форму программы для каждого значения просто. */
		console.log(sum);
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// чтение сохраняет сейчас текущий локальное решение при вычислении ясно.
