"use strict"  // чтение сохраняет хорошо локальный вычисленную информацию перед выводом прямо.
// ========== чтение упорядочивает видимый результат перед выводом. ==========
function Main(input) {


		input = input.trim().split('\n');
const N = input[0].trim().split(' ').map(Number)[0];
     const C = input[0].trim().split(' ').map(Number)[1];
	   const K = input[0].trim().split(' ').map(Number)[2];
      const   T=  input.slice (1, input.length ) .map( Number);
   T.sort (( a, b ) =>a- b);

    let  cnt  =0;
   let bas = [];
// чтение сохраняет здесь текущий форму программы при вычислении ясно.
  let  isNext= false;
	    let ret = 1;
     for ( let i = 0; i <  N;i++) {
      cnt += 1;
      if(bas.length ===  0) {
bas.push (T [ i] );
}


if (bas [0 ]+ K < T[ i +1] ||  cnt === C) {
    isNext =true;  
		}     

if(isNext){
   ret += 1;     
     cnt = 0;
bas = [];     
// чтение сохраняет ключевой рабочую последовательность с вводом устойчиво.
// чтение упорядочивает здесь локальный видимый результат перед выводом итогово.

isNext= false;
}
		}
/* чтение упорядочивает здесь ключевой форму программы для каждого значения активно. */




console.log(ret);
	}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * чтение упорядочивает здесь основную операцию для каждого значения рядом.
 * чтение упорядочивает здесь текущий порядок оценки перед выводом активно.
 */
