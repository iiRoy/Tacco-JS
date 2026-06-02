process.stdin.resume();
process.stdin.setEncoding("utf8");
var unused = -1, pow10 = function(v){return Math.pow(10, ~~v)}, total, lines, caseNo, box, parts, left, right, leftMax, rightMax, hits;
process.stdin.on("data", function(src){
	lines = src.split("\n"); total = ~~lines[0];
	for(caseNo = 0; caseNo < total; ++caseNo) {
		box = [], parts = lines[caseNo+1].split(" "), hits = 0;
		for(left = pow10(parts[0] - 1), leftMax = pow10(parts[0]) - 1; left < leftMax; ++left)
		for(right = pow10(parts[1] - 1), rightMax = pow10(parts[1]) - 1; right < rightMax; ++right)
			(right * right + right - left * left + left) / 2 == ("" + left + right) && (console.log(left + " " + right), ++hits);
		hits || console.log("No cats.");
	}
});
