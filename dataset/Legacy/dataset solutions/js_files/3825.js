'use strict';
function Main(input) {
	input = parseInt(input.trim());  
	if(input<1){
      return;
    }
  	for(let i = input; i > 0; i--){
    	if(Math.sqrt(i)%1===0){
          console.log('%d',i);
          return;
        }
    }
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
