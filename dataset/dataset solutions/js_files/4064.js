function Main(input) {
	input = input.split("\n");
	var M = input[0].split(" ").map(a => parseInt(a));
	var N = M[0];
	M = M[1];
	var L = [], R = [], D = [];
	var x = new Array(N).fill(0);
	var x2 = new Array(N);
	var ans = "Yes";
	for(var i = 0; i < N; i++){x2[i] = [];}
	for(i = 0; i < M; i++){
		L[i] = input[i+1].split(" ").map(a => parseInt(a));
		R[i] = L[i][1]-1;
		D[i] = L[i][2];
		L[i] = L[i][0]-1;
		x2[L[i]].push(R[i], D[i]);
		x2[R[i]].push(L[i], -D[i]);
	}
	
	for(i = 0; i < N; i++){
		var j = x2[i].length - 2;
		var x3 = [];
		if(j >= 0){
			set_x(i, j);
		}
		for(var k = 0; k < x3.length; k++){
			j = x2[x3[k]].length - 2;
			if(j >= 0){
				set_x(x3[k], j);
			}
		}
	}
	
	for(i = 0; i < M; i++){
		if(x[R[i]] - x[L[i]] !== D[i]){
			ans = "No";
			break;
		}
	}
	
	console.log(ans);
	
	function set_x(i, j){
		do{
			if(x2[x2[i][j]].length > 0)x3.push(x2[i][j]);
			x[x2[i][j]] = x[i] + x2[i][j+1];
			j -= 2;
		}while(j >= 0)
		x2[i] = [];
	}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));