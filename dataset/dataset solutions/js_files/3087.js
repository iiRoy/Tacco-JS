function main(arg) {
	arg = arg.split("\n")
	var tmp = arg.shift()
	var s = arg.shift().split("")
	var N = s.length
	var data = arg.map(e => e.split(" "))
	var idxs = new Array(s.length).fill(0)

	for (var i = 0; i < idxs.length; i++) {
		idxs[i] = 1
	}

	for (var i = 0; i < data.length; i++) {
		var ti = data[i][0]
		var di = data[i][1]
		var next = new Array(s.length).fill(0)
		for (var j = 0; j < s.length; j++) {
			if (s[j] !== ti) {
				next[j] += idxs[j]
			} else {
				if (di === 'L') {
					if (j - 1 >= 0) {
						next[j - 1] += idxs[j]
					}
				} else if (di === 'R') {
					if ((j + 1 < N)) {
						idxs[j + 1] += idxs[j]
					}
				}
			}
		}
		// console.log(idxs)
		idxs = next
	}
	var ans = 0
	for (var i = 0; i < idxs.length; i++) {
		ans += idxs[i]
	}
	// console.log(idxs)
	console.log(ans)
	// console.log(N)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));