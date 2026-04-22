"use strict";
function Main(input) {
    let lines = input.split("\n");
    let n = lines.shift().split(/\s/)[0];
    let N =Number(n);
let ans = "";
while (N != 0) {
		if (N % 2 != 0) {
			N--;
			ans = "1" + ans;
		}
		else ans = "0" + ans;
		N /= -2;
	}
	if (ans == "") ans = "0";
	console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));