function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	var H = parseInt(input[0][0], 10);
	var W = parseInt(input[0][1], 10);
	var arr_S = [];
	var colorPairMap = [];
	var tmpIslandMap = [];

	for (var i = 0; i < H; i++){
		arr_S.push(input[i + 1]);
		colorPairMap.push(Array.from({length: W}, () => 0));
		tmpIslandMap.push(Array.from({length: W}, () => -1));
	}
	var tmp = '';
	for (var i = 0; i < H; i++){
		for (var j = 0; j < W; j++){
			if ((i + j) % 2 === 0) tmp = '#';
			else tmp = '.';
			if (arr_S[i][0].substr(j, 1) === tmp) colorPairMap[i][j] = 1;
		}
	}

	
	var tmpIslandID = 0;
	var tmpAdj = [];
	var eachIslandColorCount = [];
	var eachIslandCoordinates = [];
	var tmpList;
	for (var i = 0; i < H; i++){
		for (var j = 0; j < W; j++){
			// console.log(i, j);
			tmpAdj = [];
			 if ((i - 1) >= 0){
				if (colorPairMap[i - 1][j] === colorPairMap[i][j]) tmpAdj.push(tmpIslandMap[i - 1][j]);
			 }
			 if ((j - 1) >= 0){
				if (colorPairMap[i][j - 1] === colorPairMap[i][j])tmpAdj.push(tmpIslandMap[i][j - 1]);
			 }

			 if (tmpAdj.length > 1) {
			 	if (tmpAdj[0] !== tmpAdj[1]){
					 tmpList = eachIslandCoordinates[Math.max(tmpAdj[0], tmpAdj[1])];
					 for (var k = 0; k < tmpList.length; k++){
						 tmpIslandMap[tmpList[k][0]][tmpList[k][1]] = Math.min(tmpAdj[0], tmpAdj[1]);
						 eachIslandCoordinates[Math.min(tmpAdj[0], tmpAdj[1])].push([tmpList[k][0], tmpList[k][1]]);
					 }
					 eachIslandColorCount[Math.min(tmpAdj[0], tmpAdj[1])] = VO(eachIslandColorCount[Math.min(tmpAdj[0], tmpAdj[1])], eachIslandColorCount[Math.max(tmpAdj[0], tmpAdj[1])], '+');
					 eachIslandColorCount[Math.max(tmpAdj[0], tmpAdj[1])] = null;
				 }
				 tmpIslandMap[i][j] = Math.min(tmpAdj[0], tmpAdj[1]);
				 eachIslandColorCount[tmpIslandMap[i][j]][(i + j) % 2] ++;
				 eachIslandCoordinates[tmpIslandMap[i][j]].push([i, j]);
			 }
			 if (tmpAdj.length === 1){
				 tmpIslandMap[i][j] = tmpAdj[0];
				 eachIslandColorCount[tmpAdj[0]][(i + j) % 2] ++;
				 eachIslandCoordinates[tmpAdj[0]].push([i, j]);
			 }		
			 if (tmpAdj.length === 0){
				 tmpIslandMap[i][j] = tmpIslandID;
				 eachIslandColorCount[tmpIslandID] = [0, 0];
				 eachIslandColorCount[tmpIslandID][(i + j) % 2] ++;
				 eachIslandCoordinates[tmpIslandID] = [[i, j]];
				 tmpIslandID ++;
			 }
		}
	}
	var ans = 0;
	for (var i of eachIslandColorCount){
		if (i != null) ans += i[0] * i[1];
	}
	// console.log(ans, tmpIslandMap, eachIslandColorCount);
	console.log(ans);
}

function VO(v1, v2, op){
    var ans = []
    if (v1.length !== v2.length) {
      if (v2.length == 1){
        v2 = Array.from({ length: (v1.length) }, () => v2);
      } else {
          return null;
      }
    }
    for (var i = 0; i < v1.length; i++){
        if (op == '+') {
            ans.push(v1[i] + v2[i]);
        } 
        if (op == '-') {
            ans.push(v1[i] - v2[i]);
        } 
        if (op == '*') {
            ans.push(v1[i] * v2[i]);
        } 
        if (op == '/') {
            ans.push(v1[i] / v2[i]);
        } 
        if (op == '%') {
            ans.push(v1[i] % v2[i]);
        } 
        if (op == '||') {
            ans.push(Math.max(v1[i],v2[i]));
        } 
    }
    return ans;    
}


Main(require("fs").readFileSync("/dev/stdin", "utf8")); 