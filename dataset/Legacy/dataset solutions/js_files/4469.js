// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
 
	var line1 = input[0].split(" ");
	var a = Number(line1[0])
	var b = Number(line1[1]);
	if((a+b)%3 && a%3 && b%3){
	    console.log("Impossible");
	} else {
	    console.log("Possible")
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));