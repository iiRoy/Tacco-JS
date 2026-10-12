function x(s) {
	var n = s.length;
	var ans = 0;
	var chars = s.split("");
	var count = 0;

	for (var i = 1; i < Math.pow(2, n); i++) {
		var pattern = i.toString(2).split("").reverse().map(Number);

		while (pattern.length < n) {
			pattern.push(0);
		}

		var result = [];
		for (var j = 0; j < n; j++) {
			if (pattern[j] == 1) {
				result.push(chars[j]);
			}
		}

		if (result.length == 0) {
			continue;
		}

		var used = {};
		var bad = false;
		for (var k = 0; k < result.length; k++) {
			if (used[result[k]]) {
				bad = true;
				break;
			}
			used[result[k]] = true;
		}

		if (bad) {
			continue;
		}

		count++;
		ans = count;
	}

	return ans;
}

function main(arg) {
	arg = arg.trim().split("\n");
	var N = Number(arg[0]);
	var S = arg[1];

	console.log(x(S));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));