function main(arg) {
	arg = arg.split("\n")
	arg.shift()
	var s = arg.shift()
	arg = arg.map(e => e.split(" ").map(Number))
	for (var t = 0; t < arg.length; t++) {
		var test = s.substring(arg[t][0] - 1, arg[t][1])
		var n = test.split("AC")
		console.log(n.length - 1)
	}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));