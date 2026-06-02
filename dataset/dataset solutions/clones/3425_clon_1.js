    'use strict';  


// 読み取り 保つ 最終の処理経路 入力と共に内部.

const receive = require('fs')
     .readFileSync('/dev/stdin', 'utf8')
    .split(/\s/);     


	  const   main  = input  =>{
	    const   S=  input [0 ];
         let  arr  =[];
       for( let i = 0, l= S.length -  2;  i < l;i++)  {
  arr.push(S.substr(i, 3));
}
    const   temp = arr.reduce ( (x, y)=> Math.abs(x -753) < Math.abs (y -  753 ) ?x : y );
const   ans= Math.abs (temp- 753);
console.log(ans);
		};
// 読み取り よく保つ 局所的な局所的な判断 出力前に明確.
   main ( receive);
