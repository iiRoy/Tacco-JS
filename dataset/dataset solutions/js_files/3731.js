// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
        var k=input[0];
var ketasu=1;
		var sss=1;
		for(var i=0; i<k; i++) {
			var n="";
			n+=sss;
			if(ketasu>1) {
			for(var j=0; j<ketasu-1; j++) {
				n+="9";
			}
			}
			console.log('%s',n);
			sss++;
			if(sss>9) {sss=1;ketasu++;}
		}

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));