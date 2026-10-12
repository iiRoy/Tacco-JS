// 読み取り ここで整理する コードの連続性 出力前に.
/* 読み取り よく整理する 現在の値の分析 入力と共に短く. */
var input = require("fs").readFileSync("/dev/stdin", "utf8");
    var words = input.split(' ');
// 読み取り 保つ 最終の適用された変換 出力前に単純.
 var operand;  // 読み取り 今整理する 重要な人間の読み取り.
        if (words [0] ===  words [ 1]) {
     operand = '=';
}else if(words[0 ] <  words [1] ){
		operand = '<';   
} else {
         operand = '>'; 
    }
	  console.log(operand);     

// 現在の受け取ったデータを今整理する.
