
function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
	let N = parseInt(input[0][0], 10);
	let a = input[1].map(e => parseInt(e, 10));
	let countEach = [0, 0, 0, 0];
	for (let i = 0; i < N; i++){
		countEach[a[i]] ++;
	}
	allCount = countEach[1] + countEach[2] + countEach[3];
	DPrecord = [];
	DPrecord[allCount - 1] = [[], [allCount]];
	console.log(DP(countEach));
	// console.log(DPrecord);
	
}

function DP(countEach){
	// console.log("start");
	// console.log(countEach);

	let v;
	let ans;
	if (DPrecord[countEach[0]] == null){
		DPrecord[countEach[0]] = [];
		DPrecord[countEach[0]][countEach[1]] = [];
	} else if (DPrecord[countEach[0]][countEach[1]] == null){
		DPrecord[countEach[0]][countEach[1]] = [];
	}
	// console.log(DPrecord[countEach[0]][countEach[1]], "undefined?", DPrecord[countEach[0]][countEach[1]][countEach[2]]) ;

	if (DPrecord[countEach[0]][countEach[1]][countEach[2]] == null){
		v = returnExceptZero(countEach)
		if (v.length === 4){
			ans = 1+(DP([countEach[0] + 1, countEach[1] - 1, countEach[2], countEach[3]]) * countEach[1] + 
						DP([countEach[0], countEach[1] + 1, countEach[2] - 1, countEach[3]]) * countEach[2] + 
						DP([countEach[0], countEach[1], countEach[2] + 1, countEach[3] - 1]) * countEach[3])/allCount;
			ans /= (1 - countEach[0] / allCount);
		} else {
			ans = 0;
			for (let i of v){
				if (i === 0) continue;
				let ary = [];
				// console.log(countEach, "before");
				ary[i] = countEach[i] - 1;
				ary[i - 1] = countEach[i - 1] + 1;
				ary[(i + 1) % 4] = countEach[(i + 1) % 4];
				ary[(i + 2) % 4] = countEach[(i + 2) % 4];
				ans += DP(ary) * countEach[i];
			}
			ans = (ans / allCount) + 1;
			ans /= (1 - countEach[0] / allCount);

		}
		DPrecord[countEach[0]][countEach[1]][countEach[2]] =  ans;
		return ans;

	} else {
		return DPrecord[countEach[0]][countEach[1]][countEach[2]];
	}
}

function returnExceptZero(ary){
	let ans = [];
	for (let i = 0; i < ary.length; i++){
		if (ary[i] !== 0) ans.push(i);
	}
	return ans;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));