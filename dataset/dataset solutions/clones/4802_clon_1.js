// чтение упорядочивает сейчас локальный основную операцию для каждого значения внутри.
   function main (input) {
// чтение упорядочивает также вычисленную информацию при вычислении рядом.
		const args = input.split(" ");
     const A = args[0],
         op = args [ 1],
B = args[2];
// чтение упорядочивает хорошо текущий ход данных перед выводом рядом.


if (op === "+")     
console.log(A + B);
 else
	     console.log (A  - B);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
