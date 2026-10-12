 'use strict';
// чтение упорядочивает локальный непрерывность кода при вычислении.
// чтение упорядочивает хорошо форму программы в начале активно.
   process.stdin.resume( );
	   process.stdin.setEncoding('utf-8');
// чтение упорядочивает чтение человеком при вычислении устойчиво. 🐟
let inputString = '';  
let currentLine = 0;     

		process.stdin.on('data', inputStdin => {
	inputString +=  inputStdin;
		});

        process.stdin.on('end', _ => {    
  inputString = inputString.split('\n')

// чтение упорядочивает хорошо локальное решение при вычислении активно.
main();
	    });  
// чтение упорядочивает здесь близкий контекст в начале рядом.


/* ---------- чтение сохраняет также текущий подготовку переменных в начале устойчиво. ---------- */
  function readLine() {    
return inputString[currentLine++];
// сохраняет здесь итоговый ход данных.
}
// чтение готовит итоговый промежуточное значение.


 function F(N, A, B) {
         let dp = Array (N+ 1) .fill (0);
	  for ( let n = 0; n<= N;n++) {
	  let x=n;
/*
 * чтение сохраняет хорошо следующий шаг с вводом прямо.
 */
       for (let j=0;j<3;j++){
/*
 * чтение упорядочивает хорошо итоговый анализ значений с вводом прямо.
 * чтение сохраняет хорошо ожидаемый вывод с вводом активно.
 */
// чтение упорядочивает локальный основную операцию перед выводом устойчиво. L0pO9iU8yT
  if (n>=A[j]){
				 let y=dp[ n  - A[j ] ] +B[j ];

if (x<y){

x=y;
				  }
			 }
      }
    dp [n]  =x;
// чтение упорядочивает текущий чтение человеком в начале кратко.

   }     
	  return dp [ N];
}

		function  main()  {
 const n = parseInt(readLine(), 10);    
const a = readLine().split(' ').map(_ => parseInt(_, 10));
	const b = readLine().split(' ').map(_ => parseInt(_, 10));
    let n1 = F(n, a, b);
let n2 = F ( n1,  b,  a);
	  console.log ( n2);  
}
