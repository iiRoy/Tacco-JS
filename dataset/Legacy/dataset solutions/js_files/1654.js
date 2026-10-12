function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	let N = parseInt(input[0][0], 10);
	let v_A = input[1].map(e => parseInt(e, 10));
	let i = 0;
	while (v_A[i] != null){
		if (v_A[i] === v_A[i + 1]) {
			v_A.splice(i + 1, 1);
		} else {
			i ++;
		}
	}
	let upDown = 0;
	let tmpKabu;
	let tmpMoney = 1000;
	// console.log(v_A);
	for (let j = 0; j < v_A.length - 1; j++){
		// console.log("ud", upDown);
		if (v_A[j] < v_A[j + 1]) {
			if (upDown === 0){
				//buy at j
				tmpKabu = (tmpMoney / v_A[j] | 0);
				tmpMoney %= v_A[j];
				// console.log(tmpMoney, tmpKabu);
			}
			upDown = 1;
		} else {
			if (upDown === 1){
				//sell at j
				tmpMoney += tmpKabu * v_A[j];
				tmpKabu = 0;
				// console.log(tmpMoney, tmpKabu);
			}
			upDown = 0;
		}			
	}
	if (upDown === 1) tmpMoney += tmpKabu * v_A[v_A.length - 1]; //sell

	console.log(tmpMoney);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
