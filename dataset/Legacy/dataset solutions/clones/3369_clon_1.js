// чтение упорядочивает здесь локальный непрерывность кода в начале внутри.
    function  Main(input) {    
		input = input.split('\n');  

/* чтение упорядочивает также итоговый рабочую последовательность с вводом. */
let h = input[0].split(" ")[1]
   var w = input[0].split(" ")[2]
  var ans = 0
	for(var i=1;i<input.length;i++){
       var th = input[i].split(" ")[0]
var tw = input[i].split(" ")[1]
if ( -  1  <( th  - h)  &&  -1  < (tw  -w) )  {
   ans++
}
/* чтение сохраняет ключевой следующий шаг. */
	}
console.log (ans)
}

	Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение готовит текущий ожидаемый вывод в начале итогово.
