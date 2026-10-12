function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
	var n = parseInt(input[0][0],10);
	var v_rc = [];
	for (var i = 0; i < n; i++){
		v_rc.push(parseInt(input[i + 1][0], 10));
	}
	v_rc.push(parseInt(input[n][1], 10))
	dp = [];
	for (var i = 0; i < n; i++){
		dp.push([]);
		for (var j = 0; j < n; j++){
			dp[i].push([-1]);
		}
	}
	// console.log(dp);

	console.log(kukanDP(v_rc, 0, n - 1)[0]);
	// console.log(dp);

}

function kukanDP(w, l, r){
	// console.log("lr", l, r);
    //既に計算済み？
    if(dp[l][r][0] !== -1) return dp[l][r];

    //lとr同じなら0
    if(l === r) {
		return dp[l][r] = [0, w[l], w[l + 1]];
	}

	if(Math.abs(l - r) === 1) {
		return dp[l][r] = [w[l] * w[r] * w[Math.max(l, r) + 1], w[Math.min(l, r)], w[Math.max(l, r) + 1]].slice();
	}

	let res = Infinity;
	let tmp, tmpL, tmpR;
    //区間を分ける
    for(let mid = l; mid <= r - 1; mid++){
		tmpL = kukanDP(w, l, mid);
		tmpR = kukanDP(w, mid + 1, r);
		// console.log("here", tmpL, tmpR,  "lr", l ,r, mid);
		tmp = tmpL[0] + tmpR[0] + tmpL[1] * tmpL[2] * tmpR[2];
		if (tmp < res){
			res = tmp;
		}
	}
	// console.log("2",l,r, dp);
    return dp[l][r] = [res, w[l], w[r + 1]];
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));


