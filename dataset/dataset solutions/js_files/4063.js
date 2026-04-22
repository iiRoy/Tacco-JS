function Main(input) {
	input = input.split("\n");
	var M = input[0].split(" ").map(a => parseInt(a));
	var N = M[0];
	M = M[1];
	var L = [], R = [], D = [];
	for(var i = 0; i < M; i++){
		L[i] = input[i+1].split(" ").map(a => parseInt(a));
		R[i] = L[i][1];
		D[i] = L[i][2];
		L[i] = L[i][0];
	}
	var x = new Array(N+1);
	var ans = "Yes";
	var i = L.length - 1, j, k;
	var ary = [];
	
	top:
	while(i >= 0){
		x[L[i]] = 0;
		x[R[i]] = D[i];
		ary = [L[i], R[i]];
		L.pop();
		R.pop();
		D.pop();
		j = 2;
		
		while(j){
			k = ary[j - 1];
			ary.pop();
			i = L.findIndex(a => a === k);
			while(i >= 0){
				if(x[R[i]] !== undefined){
					if(x[R[i]] !== x[L[i]] + D[i]){
						ans = "No";
						break top;
					}
				}else{
					x[R[i]] = x[L[i]] + D[i];
					ary.push(R[i]);
				}
				L.splice(i, 1);
				R.splice(i, 1);
				D.splice(i, 1);
				i = L.findIndex(a => a === k);
			}
			i = R.findIndex(a => a === k);
			while(i >= 0){
				if(x[L[i]] !== undefined){
					if(x[L[i]] !== x[R[i]] - D[i]){
						ans = "No";
						break top;
					}
				}else{
					x[L[i]] = x[R[i]] - D[i];
					ary.push(L[i]);
				}
				L.splice(i, 1);
				R.splice(i, 1);
				D.splice(i, 1);
				i = R.findIndex(a => a === k);
			}
			j = ary.length;
		}
		i = L.length - 1;
	}
	
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));