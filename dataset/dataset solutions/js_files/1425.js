function stdin() {
	return require("fs").readFileSync("/dev/stdin", "utf8");
}

var alpha = 'abcdefghijklmnopqrstuvwxyz'.split(''),
	res = stdin().split('').reduce(function(memo, c) {
		c = c.toLowerCase();
		c.match(/[a-zA-z]/) ? memo[c] = memo[c]+1 || 1 : null;
		return memo;
	}, {});

alpha.forEach(function(c) {
	console.log(c + ' : '+ (res[c] ? res[c] : 0));
});