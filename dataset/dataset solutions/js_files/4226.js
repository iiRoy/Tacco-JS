function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
    var H = parseInt(input[0][0], 10);
	var W = parseInt(input[0][1], 10);
	
	var lVl = 10;
    var graph = [];
    for (var i = 0; i < lVl; i++){
        graph.push(input[i + 1].map(e => parseInt(e, 10)));
	}
	var v_A = Array.from({length: lVl}, () => 0);
	var line;
	for (var i = 0; i < H; i++){
		line = input[i + 1 + lVl].map(e => parseInt(e, 10));
		for  (var x of line){
			if (x === -1) continue;
			v_A[x] ++;
		}
	}

//ここがコア
    for(var k = 0; k < lVl; k++){
        for(var i = 0; i < lVl; i++){
            for(var j = 0; j < lVl; j++) {
            graph[i][j] = Math.min(graph[i][j], graph[i][k] + graph[k][j]);
            }
        }
    }
//ここまで

	var ans = 0;

	for (var i = 0; i < lVl; i++){
		ans += graph[i][1] * v_A[i];
	}

	console.log(ans);

}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
