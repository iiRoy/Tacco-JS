// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var N = parseInt(input[0], 10);

	var valley = toIntAll(tmp);
	var sumValley=0;
	for(var i=0; i<valley.length; i++){
		sumValley += valley[i];
	}

	var tmpSum = 0;
	for(var i=1; i<valley.length; i+=2){
		tmpSum += valley[i];
	}
	tmpMountainZero = sumValley - (2*tmpSum);

	var tmpMountain = [];
	tmpMountain[0] = tmpMountainZero;
	for(var i=1; i<valley.length; i++){
		tmpMountain[i] = (valley[i-1] - (tmpMountain[i-1]/2)) * 2;
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
