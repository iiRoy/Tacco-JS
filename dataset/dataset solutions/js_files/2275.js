function Main(input) {
	var inputSplit = input.split(' ');

	var maisu = inputSplit[0];
	var sougaku = 500 * parseInt(maisu, 10);
	var kingaku = inputSplit[1];
	
	if (sougaku >= kingaku) {
		console.log('yes');
	} else {
		console.log('no');
	}
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
