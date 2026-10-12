// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var N = parseInt(input[0], 10);

	var valley = toIntAll(tmp);
	var maxValley = -Infinity;
	var maxValleyIndex = 0;
	var sumValley=0;
	for(var i=0; i<valley.length; i++){
		if(valley[i] > maxValley){
			maxValleyIndex = i;
			maxValley = valley[i];
		}

		sumValley += valley[i];
	}

	var sumMountain = 0;
	var mountainIndex1 = maxValleyIndex;
	var mountainIndex2 = (maxValleyIndex+1)%N;
	var tmpMountain;
	var isContradiction = true;
	for(var j=0; j<=maxValley; j++){
		//仮定を置く
		tmpMountain = [];
		sumMountain = 0;
		tmpMountain[mountainIndex1] = j*2;
		tmpMountain[mountainIndex2] = (maxValley-j)*2

		sumMountain = tmpMountain[mountainIndex1] + tmpMountain[mountainIndex2];
		//仮定に沿って決定
		for(var tmpIndex1=(mountainIndex1+1)%N; ; tmpIndex1=(tmpIndex1+1)%N){
			tmpIndex2 = (tmpIndex1+1)%N;
			tmpMountainOne = (valley[tmpIndex1] - (tmpMountain[tmpIndex1]/2)) * 2;

			//山に降った雨は非負である。矛盾発生
			if(tmpMountainOne < 0){
				isContradiction = true;
				break;
			}

			//代入するターンかどうか
			if(tmpIndex2 !== mountainIndex1){
				tmpMountain[tmpIndex2] = tmpMountainOne;
				sumMountain += tmpMountain[tmpIndex2];
				if(sumMountain > sumValley){
					isContradiction = true;
					break;
				}
			}
			//1周終了
			else{
				//矛盾があるか検証
				if(tmpMountainOne === tmpMountain[mountainIndex1]){
					//矛盾なし
					isContradiction = false;
					break;
				}
				else{
					//矛盾あり
					isContradiction = true;
					break;
				}
			}
		}
		if(isContradiction === false) break;
	}
	//出力
	console.log('%s', outputDelimiterSpace(tmpMountain));
}
function toIntAll(input){
  var out = []
  for(var i=0; i<input.length; i++){
    out[i] = parseInt(input[i]);
  }
  return out;
}
function outputDelimiterSpace(words){
  var out = words.join(' ');
  out += '\n';
  return out;
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
