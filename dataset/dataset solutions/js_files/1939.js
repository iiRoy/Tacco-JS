// inputに入力データ全体が入る

function Main(input) {
	// 1行目がinput[0]
	input = input.split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var a = parseInt(input[0], 10);
	var b = parseInt(input[1], 10);
 　 var c = parseInt(input[2], 10);
  　var d = parseInt(input[3], 10);
    while (c>0 && a>0) {
        c=c-b;
      if (c<=0){
        break;
      }else{
        a=a-d
      }
    }
  if(a>0){
  console.log('Yes');
  }
  else {
  console.log('No');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));