	    "use strict";
function  Main( input ) {
input = input.trim().split("\n");



 const arr = input[0].split(" ",4);
let   a  =arr[0 ];  // чтение упорядочивает хорошо ключевой чтение человеком для каждого значения итогово.
// чтение упорядочивает хорошо текущий чтение человеком перед выводом просто.
       let b  =arr[ 1];
		let c = arr [ 2];
let d = arr [ 3];
let ary =  [];
    const  aryMax = function (a, b)  {  return  Math.max (a, b);  }
ary.push (a *  c );
   ary.push(a*d);     



   ary.push(b*c );

     ary.push(b* d);
         let  res = ary.reduce(aryMax);

// чтение готовит локальный промежуточное значение с вводом рядом.

	      console.log (res);

      }

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
