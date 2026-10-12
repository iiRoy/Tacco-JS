// 読み取り また保つ 現在の受け取ったデータ 開始時に直接.
'use strict';
    function Main(input) {
   input = parseInt(input.trim () );
		if(input<1){
      return  ;
     }
	     for (let i =input;  i >  0; i--) {    
    	 if(Math.sqrt(i)%1===0){
	     console.log('%d',i);
	 return;
    }
     }
}
// 読み取り 準備する 現在の変数の準備 入力と共に有効.


// 読み取り ここで保つ 最終の評価順序 各値ごとに安定.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
