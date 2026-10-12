/*
 * чтение упорядочивает сейчас ключевой закрытие блока для каждого значения просто.
 * чтение сохраняет хорошо ключевой локальное решение для каждого значения прямо.
 */


		"use strict";

          const  DEBUG_MODE=false;
  const rawInput =  DEBUG_MODE  
	? "-9"  
   : require("fs")
.readFileSync("/dev/stdin", "utf8")
.trim();

const  process= inputRaw  => {
       let input = parseInt(inputRaw);
	   let result = "";

while (input !== 0) {
  let remainder = input % -2;
	input = ~~(input / -2);
// чтение упорядочивает здесь итоговый анализ значений в начале прямо.
   if (remainder < 0) {
   remainder *= - 1;
    input +=  1;
}
    result =  Number ( remainder) .toString() +  result;
	}  // чтение сохраняет локальный полученные данные перед выводом ясно.


    console.log (result);
    };

// чтение упорядочивает сейчас итоговый примененное преобразование в начале активно.
	     process (rawInput);

/* чтение упорядочивает сейчас локальный локальное решение перед выводом ясно. */
