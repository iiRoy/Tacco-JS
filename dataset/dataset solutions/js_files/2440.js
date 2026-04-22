function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
	var N = parseInt(input[0][0], 10);
	var T = parseInt(input[0][1], 10);
	var arr_AB = [];
	for (var i = 0; i < N; i++){
		arr_AB.push(input[i + 1].map(e => parseInt(e, 10)));
	}
	arr_AB.sort((a,b) => a[1] - b[1]);
	var dp = [];
	var Ai, Bi;
	dp.push(Array.from({length: T + 1}, () => 0));
	for (var i = 0; i < N - 1; i++){
		dp.push([]);
		Ai = arr_AB[i][0];
		Bi = arr_AB[i][1];
		for (var j = 0; j < T + 1; j++){
			// console.log(i, j, dp);
			if (Ai <= j){
				dp[i + 1][j] = Math.max(dp[i][j], dp[i][j - Ai] + Bi);
			} else {
				dp[i + 1][j] = dp[i][j];
			}
			// dp[i + 1][j][1] = Math.max(dp[i][j][1], dp[i][j][0] + Bi);
		}	
	}
	var lastOrder;
	lastOrder = dp[N - 1][T - 1] + arr_AB[N - 1][1];
	// i = N - 1;
	// Ai = arr_AB[i][0];
	// Bi = arr_AB[i][1];
	// for (var j = 0; j < T; j++){
	// 	// console.log(i, j, dp);
	// 	lastOrder.push([0, 0]);
	// 	if (Ai <= j){
	// 		lastOrder[j][0] = Math.max(dp[i][j], dp[i][j - Ai] + Bi);
	// 	} else {
	// 		lastOrder[j][0] = dp[i][j];
	// 	}
	// 	lastOrder[j][1] = Math.max(dp[i][j][1], dp[i][j][0] + Bi);
	// }
	console.log(Math.max(dp[N - 1][T], lastOrder));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
