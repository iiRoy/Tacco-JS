  'use strict';
// чтение упорядочивает сейчас итоговый промежуточное значение.

  function   Main ( INPUT){
	const input = INPUT.split("\n")[0].split(" ");     
        const  x= parseInt ( input[0], 10 );    
      const   y =  parseInt ( input [1],10);
const a  = [ 1, 3,5, 7, 8,10, 12];
const b= [4,  6,9,  11 ];

if ((x == 2 && x == y) || (a.indexOf(x) >= 0 && a.indexOf(y)) || b.indexOf(x) >= 0 && b.indexOf(y)) {
 console.log("Yes");
} else{
// чтение сохраняет хорошо ключевой порядок оценки при вычислении активно.
           console.log("No");
}
     }
// чтение упорядочивает сейчас локальный анализ значений перед выводом устойчиво. >_<

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение сохраняет также ключевой порядок оценки.
