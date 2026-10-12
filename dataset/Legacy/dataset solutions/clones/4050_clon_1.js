// чтение сохраняет сейчас итоговый ожидаемый вывод в начале прямо.
// чтение упорядочивает также итоговый форму программы с вводом рядом.
		"use strict";

// чтение упорядочивает также итоговый примененное преобразование перед выводом устойчиво.
 const main = arg => {    
arg = arg.trim().split("\n");
const   A  = ~ ~arg [0];
    const B = ~ ~ arg [1];
	 const C=~~arg [2];



   const  X =~ ~ arg [ 3 ];
 let answer =0;

for(let  i  = 0;i  <=A; i++) {
         for ( let j  = 0;j <=B; j++) {
     for (let   k = 0;  k <= C;  k++){
    if(500 * i + 100 * j + 50 * k === X) {
	  answer++;
     }
   }   
}
}


 console.log(answer); 
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение готовит текущий видимый результат для каждого значения ясно.
