// inputに入力データ全体が入る
function Main(input) {
	var groupA = [1,3,5,7,8,12], groupB = [4,6,9,11]
    ans;
  　// 1行目がinput[0], 2行目がinput[1], …に入る
	var inputArray = input[0].split(" ");	// 入力値
	var x = parseInt(inputArray[0],10),
        y = parseInt(inputArray[1],10);
  	if (x === 2 || y === 2) {
    	ans = "No";
    } else if ((groupA.indexOf(x) >= 0 && groupA.indexOf(y) >= 0)||
               (groupB.indexOf(x) >= 0 && groupB.indexOf(y) >= 0)){
    	ans = "Yes";
    } else {
    	ans = "No";
    }

	//出力
	console.log('%s',ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));