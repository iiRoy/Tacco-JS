// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
  	var tmp = input[0].split(' ')
    var nums = Number(tmp[0])
    var max = Number(tmp[1])
    var number = input[1].split(' ')
    var newList = []
    
    for(var i = 0; i < nums; i++) {
		newList.push(Number(number[i])*0.5)
    }
  
  	var hanKobai = newList.reduce((a,b) => a*b)
    var count = 0
    while(max > hanKobai) {
      hanKobai += hanKobai
      count++
    }
 
	console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));