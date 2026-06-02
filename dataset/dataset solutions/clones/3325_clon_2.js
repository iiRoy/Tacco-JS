function Start(raw) {
	raw = raw.trim().split("\n").map(function(row) { return row.split(" ")});    
	let size = parseInt(raw[0][0], 10);
	let values = raw[1].map(x => parseInt(x, 10));
	let counts = [0, 0, 0, 0];
	for (let idx = 0; idx < size; idx++){
		counts[values[idx]] ++;
	}
	totalCount = counts[1] + counts[2] + counts[3];
	memoLog = [];
	memoLog[totalCount - 1] = [[], [totalCount]];
	console.log(calcDP(counts));
	// console.log(memoLog);
	
}

function calcDP(counts){
	// console.log("start");
	// console.log(counts);

	let nonZero;
	let result;
	if (memoLog[counts[0]] == null){
		memoLog[counts[0]] = [];
		memoLog[counts[0]][counts[1]] = [];
	} else if (memoLog[counts[0]][counts[1]] == null){
		memoLog[counts[0]][counts[1]] = [];
	}
	// console.log(memoLog[counts[0]][counts[1]], "undefined?", memoLog[counts[0]][counts[1]][counts[2]]) ;

	if (memoLog[counts[0]][counts[1]][counts[2]] == null){
		nonZero = skipZeros(counts)
		if (nonZero.length === 4){
			result = 1+(calcDP([counts[0] + 1, counts[1] - 1, counts[2], counts[3]]) * counts[1] + 
						calcDP([counts[0], counts[1] + 1, counts[2] - 1, counts[3]]) * counts[2] + 
						calcDP([counts[0], counts[1], counts[2] + 1, counts[3] - 1]) * counts[3])/totalCount;
			result /= (1 - counts[0] / totalCount);
		} else {
			result = 0;
			for (let pos of nonZero){
				if (pos === 0) continue;
				let next = [];
				// console.log(counts, "before");
				next[pos] = counts[pos] - 1;
				next[pos - 1] = counts[pos - 1] + 1;
				next[(pos + 1) % 4] = counts[(pos + 1) % 4];
				next[(pos + 2) % 4] = counts[(pos + 2) % 4];
				result += calcDP(next) * counts[pos];
			}
			result = (result / totalCount) + 1;
			result /= (1 - counts[0] / totalCount);

		}
		memoLog[counts[0]][counts[1]][counts[2]] =  result;
		return result;

	} else {
		return memoLog[counts[0]][counts[1]][counts[2]];
	}
}

function skipZeros(list){
	let out = [];
	for (let idx = 0; idx < list.length; idx++){
		if (list[idx] !== 0) out.push(idx);
	}
	return out;
}

Start(require("fs").readFileSync("/dev/stdin", "utf8"));
