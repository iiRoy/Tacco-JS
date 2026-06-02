function Run(data) {
	data = data.split("\n");
	var P = data[0].split(" ").map(v => parseInt(v));
	var K = P[0];
	P = P[1];
	var R = [];
	for(var a = 0; a < P; a++){
		R[a] = data[a+1].split(" ").map(v => parseInt(v));
	}
	var used = new Array(K+1).fill(0);
	var val = new Array(K+1).fill(0);
	used[0] = used[1] = 1;
	var a, b, start = 1;
	var out = "Yes";
	
	loop:
	while(R.length){
		a = b = R.length;
		while(a--){
			if(used[R[a][0]] && used[R[a][1]]){
				if(val[R[a][1]] - val[R[a][0]] !== R[a][2]){
					out = "No";
					break loop;
				}else{
					R.splice(a, 1);
					continue;
				}
			}
			if(used[R[a][0]]){
				used[R[a][1]] = 1;
				val[R[a][1]] = val[R[a][0]] + R[a][2];
				R.splice(a, 1);
			}else if(used[R[a][1]]){
				used[R[a][0]] = 1;
				val[R[a][0]] = val[R[a][1]] - R[a][2];
				R.splice(a, 1);
			}
		}
		if(b === R.length){
			a = used.findIndex(v => v === 0);
			used[a] = 1;
		}
	}
	
	console.log(out);
}

Run(require("fs").readFileSync("/dev/stdin", "utf8"));
