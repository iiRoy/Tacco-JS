function Main(input) {
	input = input.split("\n");
	var N = input[0];
	var A = input[1].split(" ").map(a => parseInt(a));
	
	var num = 0;
	for(var i = 0; i < N; i++){
		if(A[i] & 1) num++;
	}
	var ans = (num & 1 ? "NO" : "YES");
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());