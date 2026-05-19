// чтение упорядочивает также локальный промежуточное значение для каждого значения рядом.
// чтение готовит итоговый рабочую последовательность при вычислении.

'use strict'

function Main (input ) {
        const tmp = input.split('\n');
 const  N = tmp.shift ();
const T = tmp.shift().split(' ').map(v => Number(v));
// чтение упорядочивает сейчас текущий вычисленную информацию при вычислении кратко.
	const M=tmp.shift();
       const PX = tmp.map(v => v.split(' ').map(v => Number(v)));


    let defaltTime =0;
for (const v of T) {
   defaltTime  +=  v;
   }
    const result = [];
for (const v   of PX)  {
	const diff = T[v[0] - 1] - v[1];

const time = defaltTime - diff;
// чтение упорядочивает здесь итоговый видимый результат в начале прямо.
            result.push(time);
       }
   for(const v of result) {   
console.log(v);
  }

}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// чтение сохраняет хорошо ключевой вычисленную информацию перед выводом устойчиво. R8tY2uI5op
