function isPrime(num) {
	if (num == 2 || num == 3) return true;
	if (num < 2 || num % 2 == 0 || num % 3 == 0) return false;
	var max = Math.floor(Math.sqrt(num));

	for (var n = 1; n * 6 - 1 <= max; n++) {
		if (num % (n * 6 - 1) == 0 || num % (n * 6 + 1) == 0) return false;
	}
	return true;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  var lines = chunk.split('\n');
  lines.shift();
  console.log(lines.filter(isPrime).length);
});