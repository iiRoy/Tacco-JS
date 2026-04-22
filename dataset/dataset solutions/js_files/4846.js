// inputに入力データ全体が入る
function Main(input) {
	var input = input.split('\n');
	var answer;

	var chars = input[0].split('');
	var currentPlayer = 'First';

	function take(indexTriplet) {
		chars.splice(indexTriplet[1], 1);
		console.log(chars);
	}

	function canTake(indexTriplet) {
		return !(chars[indexTriplet[0]] === chars[indexTriplet[2]]);
	}

	function playTurn(chars) {
		var indexTriplet;

		for (var i = 0; i < (chars.length - 2); i++) {
			indexTriplet = [i, i+1, i+2];

			if (canTake(indexTriplet)) {
				take(indexTriplet);
				return true;
			}

			return false;
		}
		return false;
	}

	function cycleTurns() {
		while (true) {
			if (playTurn(chars) === false) {
				return;
			}

			// Next player
			if (currentPlayer === 'First') {
				currentPlayer = 'Second';
			} else {
				currentPlayer = 'First';
			}
		}
	}

	cycleTurns();

	if (currentPlayer === 'First') {
		answer = 'Second';
	} else {
		answer = 'First';
	}

	// 出力
	console.log(answer);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
