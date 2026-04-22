'use strict';
function Main(input) {
	input = input.split("\n");
  	var one = input[0].split(" ");
	var two = input[1].split(" ");
	
  	var num = parseInt(one[0]);
  	var sum = 0;
  	for(let i = 0 ; i < two.length; i++){
      sum += parseInt(two[i]);
    }
  
  	if(sum 	>= num ){
	  console.log("Yes");
    }else{
      console.log("No");
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));