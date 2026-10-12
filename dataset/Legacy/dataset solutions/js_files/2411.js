function Main(input) {
    var lines = input.split("\n");
    var n = Number(lines[0])
	var A = lines[1].split(" ").map(el => Number(el));
    var cumulativeSum = [0]
    A.reduce((pre, cur) => { cumulativeSum.push(pre + cur); return pre+cur}, 0)
    console.log(cumulativeSum)
    var diffs = []
    for(var i = 0; i < n - 1; i++) {
        diffs.push(Math.abs(cumulativeSum[i] - (cumulativeSum[n] - cumulativeSum[i])))
    }
    console.log(Math.min(...diffs))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));