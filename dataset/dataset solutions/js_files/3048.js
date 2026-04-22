function main(arg) {
	var data = arg.trim().split("\n")[0].split(" ").map(Number)
	var a = data[0]
	var b = data[1]
	var ans = 0
	for (var i = 0;i < 2; i++) {
		if (a > b) {
			ans += a
			a--
		} else {
			ans += b
			b--
		}
	}
	console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));