// inputに入力データ全体が入る
function Main(input) {
	var input = input.split('\n');
	var answer;

	var boxCount = parseInt( input[0].split(' ')[0] );
	var maxCandies = parseInt( input[0].split(' ')[1] );
	var candies = input[1].split(' ');
	var eatCount = 0;

	candies = candies.map((x) => parseInt(x));

	function eat(indexPair, difference) {
		if (difference <= candies[indexPair[1]]) {
			eatCount += difference;
			candies[indexPair[1]] = candies[indexPair[1]] - difference;
		} else {
			eatCount += difference;
			difference -= candies[indexPair[1]];
			candies[indexPair[1]] = 0;
			candies[indexPair[0]] = candies[indexPair[0]] - difference;
		}
	}

	function getPairSum(indexPair) {
		return candies[indexPair[0]] + candies[indexPair[1]];
	}

	function checkBoxes(candies) {
		var indexPair;

		for (var i = 0; i < (candies.length - 1); i++) {
			var difference;
			indexPair = [i, i+1];
			difference = getPairSum(indexPair) - maxCandies;

			if (difference > 0) {
				eat(indexPair, difference);
			}
		}
	}

	checkBoxes(candies);


	// 出力
	console.log(eatCount);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
