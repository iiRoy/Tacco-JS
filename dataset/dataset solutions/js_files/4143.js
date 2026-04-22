// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\n");
	var str = line[0];

	var measureBunchSize = function(str, bunchSize){

		loop : for(var i = 0; i < str.length; i++){
			if(str[i] !== str[0]){
				str = str.slice(i);
				bunchSize.push(i);
				break loop;
			} else if(i === str.length - 1){
				str = "";
				bunchSize.push(i+1);
				break loop;
			}
		}

		if(str){
			return measureBunchSize(str, bunchSize);
		} else{
			return bunchSize;
		}
	}

	var ans = 0;
	var bunchSize = measureBunchSize(str, []);
	if(bunchSize.length === 2){
		if(bunchSize[0] >= bunchSize[1]) ans = bunchSize[0];
		else ans = bunchSize[1];
	} else{
		ans = bunchSize[0] + bunchSize[1];
		for(var j = 0; j < bunchSize.length - 1; j++){
			if(ans >= bunchSize[j] + bunchSize[j+1]) ans = bunchSize[j] + bunchSize[j+1];
		}
	}
	console.log(ans);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));