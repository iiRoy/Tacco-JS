function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	var N = parseInt(input[0][0], 10);
	var arr_ab = [];
	var arr_cd = [];
	for (var i = 0; i < N; i++){
		arr_ab.push(input[i + 1].map(e => parseInt(e, 10)));
		arr_cd.push(input[i + N + 1].map(e => parseInt(e, 10)));
	}
	var arr_redConnection = Array.from({length: N}, ()=> []);
	var arr_blueConnection = Array.from({length: N}, ()=> []);
	var arr_redConnectionCount = Array.from({length: N}, ()=> 0);
	var arr_blueConnectionCount = Array.from({length: N}, ()=> 0);
	var remainedPaths = 0;
	for (var i = 0; i < N; i++){
		for (var j = 0; j < N; j++){
			if (arr_ab[i][0] < arr_cd[j][0] && arr_ab[i][1] < arr_cd[j][1]) {
			arr_redConnection[i].push(j);
			arr_redConnectionCount[i] ++;
			arr_blueConnection[j].push(i);
			arr_blueConnectionCount[j] ++;
			remainedPaths ++;
			}
		}
	}

	var tmp;
	var whichIsChosen = [-1, -1];
	var ans = 0; 
	var exclude = [Array.from({length: N}, ()=> 0), Array.from({length: N}, ()=> 0)];
	while (remainedPaths > 0){
		tmp = 2 * N;
		for (var i = 0; i < arr_redConnection.length ; i++){
			if (exclude[0][i] === 1) continue;
			for (var j of arr_redConnection[i]){
				if (exclude[1][j] === 1) continue;
				if ((arr_redConnectionCount[i] + arr_blueConnectionCount[j]) <= tmp){
					tmp = arr_redConnectionCount[i] + arr_blueConnectionCount[j];
					whichIsChosen[0] = i;
					whichIsChosen[1] = j;
				}
			}
		}
		remainedPaths -= (tmp - 1);
		ans ++;
		for (var i of arr_redConnection[whichIsChosen[0]]){
			arr_blueConnection[i] = arr_blueConnection[i].filter(n => n !== whichIsChosen[0]);
			arr_blueConnectionCount[i] --;
		}
		for (var i of arr_blueConnection[whichIsChosen[1]]){
			arr_redConnection[i] = arr_redConnection[i].filter(n => n !== whichIsChosen[1]);
			arr_redConnectionCount[i] --;
		}
		exclude[0][whichIsChosen[0]] = 1;
		exclude[1][whichIsChosen[1]] = 1;
		arr_redConnection[whichIsChosen[0]] = whichIsChosen[1];
		arr_redConnectionCount[whichIsChosen[0]] = 1;
		arr_blueConnection[whichIsChosen[1]] = whichIsChosen[0];
		arr_blueConnectionCount[whichIsChosen[1]] = 1;
	}
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 