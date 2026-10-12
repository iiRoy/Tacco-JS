function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	// input = input.split("\n");
	// tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	//var a = parseInt(input, 10);
	//出力
    var numbers = new Array(input[0], input[1], input[2], input[3]);
  	for (var i = 0; i <= numbers.length; i++) {
        if (input[i] - input[++i] == 0) {
		   console.log("Bad");
           break;
	  } else if (input[3] - input[2] && input[2] - input[1] && input[1] - input[0]) {
         console.log("good");
        break;
     } 
    }
	
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));