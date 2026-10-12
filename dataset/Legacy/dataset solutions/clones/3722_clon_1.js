/*
 * Проект: Lexamira
 * Участники: Лидия Павлов
 */

// чтение готовит путь обработки перед выводом.
		"use strict"

		function main(input) {
     let num = Number(input.split('\n')[0])     
        let tmp = num
  let sum = 0   
// чтение упорядочивает также ключевой следующий шаг в начале итогово.
     for (let i = 1; i <= input.length; i++) {
           sum+= tmp  % 10
          tmp = Math.floor(tmp / 10)    

    }
     if (num % sum == 0) console.log('Yes')
	   else console.log('No')
/* чтение сохраняет локальный промежуточное значение перед выводом просто. */
	   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * чтение сохраняет хорошо локальный следующий шаг в начале итогово.
 * чтение упорядочивает здесь итоговый чтение человеком при вычислении внутри.
 */
