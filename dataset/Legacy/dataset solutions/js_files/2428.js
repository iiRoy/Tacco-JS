function Main(input) {
	input = input.split("\n");
	var N = parseInt(input[0], 10);
	var n = N / 2
	var S = input[1]
	if (!N % 2 === 0) {
	  console.log('No');
	} else {
	  var str = [];
    for (var i = 0; i < S.length / n; i++) {
      str.push(S.substr(i * n, n));
  }
	 // console.log(str);
	  if (str[0] === str[1]){
	    console.log('Yes');
	  } else {
	    console.log('No')
	  }
	}
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));