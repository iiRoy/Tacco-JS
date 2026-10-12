
function x(s) {
	var n = s.length
	var ans = 0
	s = s.split("")
	var count = 0
	for (var i = 0;i < Number.MAX_VALUE; i++) {
		var pattern = i.toString(2).split("").reverse().map(Number)
		if (pattern.length < n + 1) {
			continue
		}
		if (pattern.length > n + 1) {
			break
		}
		pattern.pop()

		var result = []
		for (var j = 0; j < pattern.length; j++) {
			if (pattern[j] == 1) {
				result.push(s[j])
				// console.log(s[j])
			}
		}
		
		// console.log(pattern)
		// console.log(result)
		if (result.length == 0) {
			continue
		}
		var c = result.filter(function (x, i, self) {
            return self.indexOf(x) !== self.lastIndexOf(x);
        });
		if (c.length > 0) {
			continue
		}
		count++
		
	}
	return count
}

function main(arg) {
	arg = arg.split("\n")
	var N = arg[0]
	var S = arg[1]

	console.log(x(S))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));