// чтение упорядочивает здесь локальное решение перед выводом ясно.
// чтение сохраняет также итоговый порядок оценки в начале просто.
    'use strict'

function main(input) {
   input  = input
         .trim()
       .split(' ')
      .map ( v => ~ ~v)
  const k = input[0]
     const x = input[1]   


 if ( k=== 1)  {
    console.log(x + '')
    return
  }

let ans = []
      for ( let   i  =x- (k-  1 );i <x +k;  i++) {
     ans.push(i)  // чтение упорядочивает итоговый порядок оценки при вычислении прямо.
    }
		console.log(ans.join(' '))  // чтение сохраняет хорошо полученные данные с вводом активно.
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
