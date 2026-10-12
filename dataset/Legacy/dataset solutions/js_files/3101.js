function main(arg) {
	arg = arg.trim().split("\n")
	arg.shift()
	var s = arg.shift()
	arg = arg.map(e => e.split(" ").map(Number).map(e => e -1))
	var result = new Array(arg.length).fill(0)
	var count = 0
	var indexs = new Array(arg.length)
	for (var i = 0; i < arg.length; i++) {
		indexs[i] = i
	}
	for (var i = 0; i < s.length - 1; i++) {
		if (s[i] == 'A' && s[i + 1] == 'C') {
			count++
		}
		result[i + 1] = count
	}
	for (var i = 0; i < arg.length; i++) {
		let l = arg[i][0]
		let r = arg[i][1]
		console.log(result[r] - result[l])
	}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));