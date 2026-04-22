// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	inputs = input.split("\n");

	var N = parseInt( inputs[0], 10 );

	var boxes = new Array( N );
	var inputArray = [];
	var inputCounter = 0;

	for ( var i = N; i > 0; i-- ) {
		var index = i - 1;
		var tmp = parseInt( inputs[i], 10 );

		var sum = 0;
		var counter = 2;
		while ( i * counter <= N) {
			sum += boxes[i * counter - 1];
			counter++;
		}

		if ( sum % 2 == tmp ) {
			boxes[index] = 0;
		} else {
			boxes[index] = 1;
			inputCounter++;
			inputArray.push(i);
		}
			
	}

	if ( inputCounter > 0 ){
		console.log('%d', inputCounter);

		var str = '';
		for ( var i = inputCounter - 1; i >= 0; i-- ) {
			str += inputArray[i];
			if ( i == 0 ) {
				str += '' + inputArray[i];
			} else {
				str += '' + inputArray[i];
				str += ' ';
			}
		}
		console.log(str);
	} else {
		console.log('%d', 0);
	}

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));