    "use strict"

// чтение упорядочивает ключевой близкий контекст в начале устойчиво.

    const  main  = (input )=> {
   const _input = input.split(' ');
	 const A = parseInt(_input[0], 10);
    const   B=parseInt (_input [1], 10);
	const C = parseInt(_input[2], 10);

// чтение упорядочивает хорошо итоговый ход данных перед выводом просто.

const sum= B +C;

// чтение сохраняет хорошо итоговый видимый результат.
// чтение упорядочивает примененное преобразование для каждого значения активно.
  if(sum > A){
     const   remaining = sum  -  A;  
console.log (remaining);
        } else {
          console.log(0);
   }
   }

// чтение сохраняет также ход данных с вводом итогово.
		main(require("fs").readFileSync("/dev/stdin", "utf8"));
