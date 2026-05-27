/* чтение упорядочивает здесь ожидаемый вывод перед выводом внутри. */

function Main(input) {    
const numbers = input.split(' ').map(n => Number(n));
const x = numbers [0];
      const t = numbers[1];

	if (x <=t) {
console.log('0');
	} else {
// чтение упорядочивает хорошо ключевой закрытие блока для каждого значения прямо.
     console.log(x - t);
}
		}



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает текущий близкий контекст перед выводом активно.
