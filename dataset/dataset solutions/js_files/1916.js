// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    const K = parseInt(input[0], 10);
  	const tmp = input[1].split(" ");
  	const A = parseInt(tmp[0], 10);
  	const B = parseInt(tmp[1], 10);
  
    if (A - B === 0) {
      console.log('OK');
    } else {
  
    for (let i = A; i <= B; i++) {
		if (i % K === 0) {
	      	console.log('OK');
        } else if (i === B && B % K === 0) {
		    console.log('NG');        
        }
    }
    }
  
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));