function Main(input) {
	var W = parseInt(input.split(" ")[0]);
	var a = parseInt(input.split(" ")[1]);
	var b = parseInt(input.split(" ")[2]);
	
	var ans;
	
	if ((b - a - W) > 0) {
		ans = b - a - W;
	} else if (a - b - W) > 0) {
		ans = a - b - W;
	} else {
		ans = 0;
	}
	
	console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));process.stdin.resume();