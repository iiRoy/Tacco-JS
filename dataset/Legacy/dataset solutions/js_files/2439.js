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
	for (var i = 0; i < N; i++){
		dp.push([]);
		Ai = arr_AB[i][0];
		Bi = arr_AB[i][1];
		for (var j = 0; j < T + 1; j++){
			// console.log(i, j, dp);
			if (Ai <= j){
				if (dp[i][j] >= dp[i][j - Ai] + Bi){
					dp[i + 1][j] = dp[i][j];
				} else {
					dp[i + 1][j] = dp[i][j - Ai] + Bi;
				}

			} else {
				dp[i + 1][j] = dp[i][j];
			}
			// dp[i + 1][j][1] = Math.max(dp[i][j][1], dp[i][j][0] + Bi);
		}	
	}

	var currentOrderList = [];
	var tmp = N;
	var j = T -1;
	whole_loop:
	while (j > 0){
		while (true){
			if (tmp === 0) break whole_loop;
			if (dp[tmp][j] === dp[tmp - 1][j]) tmp--;
			else {
				currentOrderList.push(tmp - 1);
				j -= arr_AB[tmp - 1][0];
				tmp--;
				continue whole_loop;
			}
		}	
	}
	// console.log(currentOrderList);
	// console.log(arr_AB);
	for (var x of currentOrderList){
		arr_AB.splice(x, 1);
	}
	
	var lastOrder = 0;
	if (arr_AB.length > 0) lastOrder = dp[N][T - 1] + arr_AB[arr_AB.length - 1][1];
	console.log(Math.max(dp[N][T], lastOrder));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
