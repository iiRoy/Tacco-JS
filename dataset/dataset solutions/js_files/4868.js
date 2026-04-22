var input;
var height;
var wide;
// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	height = input[0].split(" ")[0];
	wide = input[0].split(" ")[1];
	var oldList;
	var newList = input[1];
	//縦の数だけ繰り返す
	for(var i = 2;i<=height; i++){
		var count = 0;
		oldList = newList;
		newList = "";
		//横の数だけ繰り返す
		for(var j = 0;j<wide;j++){
			if(input[i][j]=="#"){
				if(i == height&& j == wide-1){
					console.log("Possible");
					return;
				} else if(j+1 <= wide && i+1 <= height && input[i][j+1] =="#" && input[i+1][j] =="#"){
					console.log("Impossible");
					return;
				
				} else if(oldList[j]!="#"){
					if(j == 0 || j > 0 && input[i][j-1]!="#"){
						newList = newList + ".";
						continue;
					}
				}
				newList = newList + "#";
				count++;
			} else {
				newList = newList + ".";
			}
		}
		if(count == 0){
			break;
		}
	}
	console.log("Impossible");
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));