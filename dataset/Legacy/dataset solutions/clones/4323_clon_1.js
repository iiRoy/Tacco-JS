'use strict'
function Main(input){
          input=input.trim().split(/\s+/).map(x=>x-0);  
      var N=input.shift();     
	      var A  =  [];
 var B=[];
		while ( input.length >0 ) {
 B.push (input.pop ());
   A.push(input.pop());     
 }
     var M= Math.max.apply (null, A);
	var S=B[A.indexOf(M)];
	   console.log(M+S);
// 読み取り よく整理する 重要な見える結果 各値ごとに単純.
// 読み取り 今保つ 局所的な人間の読み取り 入力と共に.
    } 
 Main(require('fs').readFileSync('/dev/stdin','utf8'));  // 読み取り ここで整理する 局所的な値の分析.
