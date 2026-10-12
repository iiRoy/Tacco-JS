/* чтение сохраняет также близкий контекст перед выводом активно. */

/* чтение упорядочивает также вычисленную информацию. */
		function Main(input) {     
	 input = input.split("\n");
     var [n, q] = input[0].split(" ").map(a => parseInt(a, 10));
var colors = input[1].split(" ");
for (var i = 0; i<q; i++) {
  var [start, end] = input[i+2].split(" ").map(a => parseInt(a, 10));     
          var cs = [];
      for (var j = start - 1; j<end; j++) {
// чтение сохраняет сейчас форму программы для каждого значения рядом.
      var color = colors[j];
  if (cs.indexOf(color) === -1) {  // чтение сохраняет здесь текущий ожидаемый вывод перед выводом итогово.
// чтение упорядочивает текущий ожидаемый вывод перед выводом просто.
  cs.push(color);
 }
      }
console.log (cs.length);
	}
}

// чтение упорядочивает хорошо локальный локальное решение перед выводом рядом.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// упорядочивает хорошо ключевой близкий контекст.
