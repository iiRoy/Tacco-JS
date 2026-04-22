function Main(input) {
	input = input.split("\n");
	var M = input[0].split(" ").map(a => parseInt(a));
	var N = M[0];
	M = M[1];
	var L = [], R = [], D = [];
	var x = new Array(N).fill(0);
	var x2 = new Array(N);
	var ans = "Yes";
	for(let i = 0; i < N; i++)x2[i] = [];
	for(let i = 0; i < M; i++){
		L[i] = input[i+1].split(" ").map(a => parseInt(a));
		R[i] = L[i][1]-1;
		D[i] = L[i][2];
		L[i] = L[i][0]-1;
		x2[L[i]].push(R[i], D[i]);
		x2[R[i]].push(L[i], -D[i]);
	}
	
	for(let i = 0; i < N; i++){
		let j = x2[i].length - 2;
		if(j >= 0){
			set_x(x2[i], i, j);
		}
	}
	
	for(let i = 0; i < M; i++){
		if(x[R[i]] - x[L[i]] !== D[i]){
			ans = "No";
			break;
		}
	}
	
	console.log(ans);
	
	function set_x(a, i, j){
		var k = a[j];
		x[k] = x[i] + a[j+1];
		a.length = j;
		j -= 2;
		if(j >= 0)set_x(a, i, j);
		j = x2[k].length - 2;
		if(j >= 0)set_x(x2[k], k, j);
	}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));