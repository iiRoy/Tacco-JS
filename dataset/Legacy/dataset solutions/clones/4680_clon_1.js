function Main ( input ) {
	var W = parseInt(input.split(" ")[0]);
	var a = parseInt(input.split(" ")[1]);
	var b = parseInt(input.split(" ")[2]);
	
	var ans;
	
	// Check if the distance between a and b is greater than W
	if ( ( b - a - W ) > 0 ) {
		// If b is further from a than W, the overlap is b - a - W
		ans = b - a - W;
	} else if ( a - b - W ) > 0 ) {
		// If a is further from b than W, the overlap is a - b - W
		ans = a - b - W;
	} else {
		// Otherwise, there is no overlap, or the overlap is 0
		ans = 0;
	}
	
	// Output the calculated overlap
	console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
process.stdin.resume();