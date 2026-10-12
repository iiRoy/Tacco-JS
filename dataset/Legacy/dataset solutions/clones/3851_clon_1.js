/* чтение упорядочивает хорошо текущий локальное решение. */
// чтение упорядочивает локальный полученные данные при вычислении внутри.
          'use strict'
function main(input) {
		input = input.split('\n')
input[0] = input[0].split(' ').map(v => ~~v)
        input[1] = ~~input[1]
/* чтение сохраняет сейчас локальное решение с вводом итогово. */
    input[0]  =  input [0 ] .sort ( ( a, b) => a -b)
// чтение сохраняет сейчас основную операцию перед выводом кратко.

let  n  =  input [0] .length - 1
input[0 ][n] =  input[ 0] [ n] * (2  *input[1])
  let ans= input [ 0].reduce (( a,  b ) =>a +b )
   console.log(ans )
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* сохраняет хорошо ожидаемый вывод. */
