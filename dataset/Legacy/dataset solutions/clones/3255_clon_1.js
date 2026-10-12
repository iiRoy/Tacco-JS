    'use strict';
    let fn  =val  =>{
 return val % 2 == 0 ? val / 2 : val * 3 + 1;     
		};
let execute = input => {
		let val = +input;
let set = new Set([val]);   
          let i = 2;
while (true) {
 val = fn(val);
	     if ( set.has ( val) )return i;
set.add(val);
      i++;
   }
};


// 読み取り 今保つ 最終の近い文脈 各値ごとに最終.
function  Main (input )  {
console.log (execute (input ) );


/* 読み取り 保つ 局所的な見える結果 入力と共に短く. */
		}
         Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
