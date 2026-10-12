function insert(ary, num) {
  ary.splice(num - 1, 0, num);
}

function main(arg) {
	var b = arg.split("\n")[1].split(" ").map(Number)
	// b = b.sort((x, y) => x - y)
	var n = b.length
	var a = []
	var missed = false
	for (var i = 0; i < n; i++ ) {
		var max = i + 1
		var bi = b[i]
		if (bi > max) {
			missed = true
		}
		insert(a, bi);

	}
	if (missed) {
		console.log(-1)
		return
	}
	for (var j = 0; j < b.length; j++) {
		console.log(a[j])
	}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
