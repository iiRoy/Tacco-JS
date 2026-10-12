function Main(input) {
	var cText = input.length;
	var sText = input.substr(0,1);
	var eText = input.substr(input.length-1,1);
        var n = sText+cText+eText;
	//出力
	console.log('%s\n',n);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));