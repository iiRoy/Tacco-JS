// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	//文字列から10進数に変換するときはparseIntを使います
	var num = Number(input[0])
    var sleepSong = input[num+1]
    var time = 0
	for(var i = 1; i <= num; i++) {
    	var current = input[i].split(' ')
        var currentSong = current[0]
        if(currentSong === sleepSong) {
          for(var j = i+1; j <= num; j++) {
            var current = input[j].split(' ')
        	var currentSongTime = Number(current[1])
            time += currentSongTime
          }
          return console.log(time)
        }
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));