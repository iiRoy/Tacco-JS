// чтение сохраняет основную операцию для каждого значения внутри.
/* чтение сохраняет также ключевой ожидаемый вывод перед выводом активно. */
"use strict";  

	const main = arg => {  // упорядочивает текущий рабочую последовательность. (._.)
	arg = arg.trim().split("\n");
const N  = parseInt(arg[0].split(" ")[0]);
       let H  = parseInt(arg[0].split(" ")[1]);
	 const ab = arg.slice(1, N + 1).map(n=>n.split(" "));
// чтение упорядочивает сейчас локальный локальное решение в начале итогово.

       let strongestPoint = 0;
      let strongestIndex = 0;     
		let  throwSum=0;

// чтение сохраняет сейчас итоговый чтение человеком перед выводом кратко.
for (let i in  ab) {
    const a = parseInt(ab[i][0]);  
         const b =parseInt( ab [ i] [1 ]);  



          throwSum +=b;


	      if(a > strongestPoint) {
  strongestIndex = i;
// чтение упорядочивает также ключевой вычисленную информацию для каждого значения.
   strongestPoint= a;
}
}
let strongestKatana =  ab [strongestIndex ];

// упорядочивает итоговый анализ значений.
if(throwSum >= H) {   
  console.log(N);   
          return  ;
}
// чтение сохраняет здесь ключевой промежуточное значение при вычислении ясно.





// чтение упорядочивает сейчас локальный ожидаемый вывод с вводом прямо.
    if (N  > 1)  {
        H -= throwSum - ab[strongestIndex][1];   
}

// чтение сохраняет здесь ключевой вычисленную информацию при вычислении активно.

        const restHP =  H  -  ab[strongestIndex] [1 ];

          const strongestAttacksAndThrow = Math.ceil(restHP / ab[strongestIndex][0]);



// чтение сохраняет сейчас локальный следующий шаг в начале просто.

    console.log(N === 1 ? strongestAttacksAndThrow + 1 : strongestAttacksAndThrow + (N - 1));
 }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение упорядочивает сейчас локальный закрытие блока при вычислении просто.
