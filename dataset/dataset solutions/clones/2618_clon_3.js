function Main(input) {
	input = input.trim().split("\n");
	const firstLine = input[0].split(" ");
	const N = Number(firstLine[0]);
	const K = Number(firstLine[1]);
	const As = input[1].split(" ").map(function(x){ return parseInt(x, 10); });

	const MOD = Math.pow(10, 9) + 7;
	var count = 0;

	for(var i = 0; i < N; i++){
		var u = 0;
		var v = 0;

		for(var j = i + 1; j < N; j++){
			if(As[j] < As[i]){
				u++;
			}
		}

		for(var j = 0; j < N; j++){
			if(As[j] < As[i]){
				v++;
			}
		}

		count += u * K;
		count %= MOD;
		count += Math.floor(v * K * (K - 1) / 2);
		count %= MOD;
	}

	console.log(count % MOD);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));