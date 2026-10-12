// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[0].split(" ");
  
	var takahashi = parseInt(tmp[0], 10);
	var aoki = parseInt(tmp[1], 10);
    var count = parseInt(tmp[2], 10);
  
	if(count > takahashi) {
      count -= takahashi
      return console.log(0, aoki-count)
    } else {
      while(count != 0) {
        if(takahashi > 0) {
          takahashi--
        }
        count--
      }
      return console.log(takahashi, aoki)
    }	
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));