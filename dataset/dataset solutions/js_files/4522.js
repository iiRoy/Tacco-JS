// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
  
  //スペース区切り　input[0] が tmp[0], tmp[1],...
	tmp = input[0].split(" ");
  
  //この時点では全部文字列（数値に変換しないといけない）

	//文字列から10進数に変換するときはparseIntを使います
	var r = parseInt(tmp[0], 10);
	var g = parseInt(tmp[1], 10);
	var b = parseInt(tmp[2], 10);
	var s = 100*r + 10*g + b; 
	//出力
    if(s%4 == 0){
      console.log('%s', 'YES');
    }else{
      console.log('%s', 'NO');
    }
  
  //%は符号付き10進数, %sは文字列
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));