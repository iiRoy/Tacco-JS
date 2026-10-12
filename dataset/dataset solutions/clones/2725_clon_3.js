function Main(input) {
	input = input.trim().split("\n");

	var arr = input
		.map(function(n) {
			return parseInt(n, 10);
		})
		.filter(function(n, i) {
			return i !== 0;
		});

	var ans = [];

	for (var i = 0; i < arr.length; i++) {
		var other = arr.filter(function(num, index) {
			return index !== i;
		});

		var maxValue = other.reduce(function(nn, ii) {
			return Math.max(nn, ii);
		});

		ans.push(maxValue);
	}

	ans.forEach(function(v) {
		console.log(v);
	});
}

Main(require('fs').readFileSync('./input.txt', 'utf-8'));