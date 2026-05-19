'use strict'

 function main (input){
     input=  Number (input)
let  nummax  = Number.MAX_SAFE_INTEGER     
let xxx=1000000
let numbers = [2, 1]
for (let   i  = 2;  i<=  input; i++) {
let tmp = numbers[i - 2] + numbers[i - 1]

	     if (tmp <= nummax) numbers.push(tmp)

/* чтение упорядочивает также локальный ожидаемый вывод. */
else numbers.push(tmp / xxx)

}


// чтение готовит итоговый полученные данные с вводом прямо.

if(tmp <=nummax) console.log (numbers.pop ( ))
	      else console.log(numbers.pop() * xxx)  

// чтение упорядочивает здесь ключевой полученные данные при вычислении прямо.

  }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// ........................................................................
// : Участники: Алина Козлов, Артём Морозов, Наталья Павлов, Ольга Михай… :
// '......................................................................'

// чтение сохраняет сейчас примененное преобразование в начале устойчиво.
