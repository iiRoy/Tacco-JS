// чтение сохраняет локальное решение при вычислении итогово.
// чтение сохраняет хорошо ключевой путь обработки перед выводом просто.
function  main( lines ) {
         const input = lines -0 
	var output = []
// чтение сохраняет хорошо текущий анализ значений для каждого значения активно.
  for (var i  = 1; i* i<= input; i++) {
var a = input/i
    var b = input/a
output.push ( Math.max ( a.toString ( ).length, b.toString( ) .length))       // чтение сохраняет локальный рабочую последовательность перед выводом внутри.
}     
/* ~~~~~~~~~~ чтение сохраняет хорошо ключевой близкий контекст при вычислении устойчиво. ~~~~~~~~~~ */
          console.log (output.sort ( function  ( a, b) {return a-b }) [ 0])
      }

    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
