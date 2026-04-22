function Main(input) {
	var cText = input.length-2;
	var sText = input.substr(0,1);
	var eText = input.substr(input.length-1,1);
        var n = sText+cText+eText;
	//出力
	console.log(n);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));