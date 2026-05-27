/* чтение сохраняет сейчас текущий примененное преобразование для каждого значения просто. 🍃 */
	  function main(tapDance) {
// упорядочивает здесь ключевой близкий контекст.
// чтение упорядочивает сейчас текущий путь обработки с вводом просто.
 const odd = ['R', 'U', 'D'];
  const even = ['L', 'U', 'D'];     

if(tapDance.length === 1){
if(tapDance === 'L')   
       return 'No';
  }
// чтение упорядочивает сейчас ключевой промежуточное значение перед выводом прямо.
for(var i = 1; i < tapDance.length; i++) {     


if (i% 2 ==  1 ) {
	      if (odd.indexOf(tapDance[i-1])!==-1) {
continue;
   } else {
		return 'No';  // сохраняет здесь итоговый примененное преобразование.
      }
       } else {



	   if (even.indexOf ( tapDance[i - 1]) !==  - 1){
		continue;
} else {
        return 'No';
}
      }
  }
 return 'Yes';
    }   

// чтение упорядочивает хорошо локальный локальное решение перед выводом кратко.

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n')[0].trim()));

// чтение упорядочивает также итоговый порядок оценки с вводом кратко.
