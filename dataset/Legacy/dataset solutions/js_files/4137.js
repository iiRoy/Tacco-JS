// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\n");
	var tmp = line[0].split(" ");
	var lower = tmp[0];
	var upper = tmp[1];

	var ans = 0;
	if(lower.length <= 14 && upper.length <= 14){
		lower = Number(lower);
		upper = Number(upper);
		while(lower <= upper){
			lower = lower * 2;
			ans++;
		}
	} else{
		lower = "0000000000" + lower;
		upper = "0000000000" + upper;
		var lowerTop = lower.slice(0,-10);
		var lowerBottom = lower.slice(-10);
		var upperTop = upper.slice(0,-10);
		var upperBottom = upper.slice(-10);
		lower = [Number(lowerTop), Number(lowerBottom)];
		upper = [Number(upperTop), Number(upperBottom)];

		var compare = function(lower, upper){
			if(lower[0] < upper[0]){
				return true;
			} else (lower[0] = upper[0] && lower[1] <= upper[1]){
				return true;
			} else{
				return false;
			}
		}

		while(compare(lower, upper)){
			var tmp = (lower[1]*2).toString();
			if(tmp.length === 11){
				lower = [lower[0]*2 + 1, Number(tmp.slice(-10))];
			} else{
				lower = [lower[0]*2, Number(tmp)];
			}
			ans++;
		}
	}
	console.log(ans);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));