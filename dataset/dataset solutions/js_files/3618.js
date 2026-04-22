// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	tmp = input[0].split(" ");
 
	var n = parseInt(tmp[0], 10);
	var k = parseInt(tmp[1], 10);
	var ans;
        
        ans = 1;
if(n%k==0){ans=0;}
 
	console.log('%d',ans);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));