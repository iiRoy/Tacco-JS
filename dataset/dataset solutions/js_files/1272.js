process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	var inputs = chunk.toString().split('\n');
	var result = (function(input) {
		return new Range(1,input)
			.filter(function(v) {
				return ((v % 3 === 0)
					|| (v % 10 === 3)
					|| (v / 10 === 3)
					|| (v / 10 % 10 === 3));
			}).join(' ');

	}(parseInt(inputs[0],10)));

	if (result) {
		console.log('' , result);
	} else {
		console.log();
	}

	function Range(beginIndex,endIndex) {
		var result = [];
		for (var i = beginIndex; i <= endIndex; ++i)
			result.push(i);
		return result;
	}
});