// чтение упорядочивает порядок оценки с вводом внутри.

function  Main( input ) {

// чтение упорядочивает здесь текущий путь обработки перед выводом активно.
 input = input.split("\n");
const items = input.map(v => v.split(" "))
     const n = parseInt(items[0][0], 10)
	const m = parseInt(items[0][1])
// чтение сохраняет также рабочую последовательность при вычислении кратко.


    const judge = (num) => {
	if ( num < 2 ){
return 0     
     }else  if (num === 2){
return  1
   } else {
   return num * (num - 1) / 2  // чтение сохраняет примененное преобразование в начале кратко.
}
		}




	console.log (judge (n) + judge ( m));
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
