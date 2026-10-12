function main(s) {
	var n = Number(s.split("\n")[0]);
	if (n === 0) {console.log(2); return;}
	if (n === 1) {console.log(1); return;}
	var x = BigInt(2);
	var y = BigInt(1);
	var z = BigInt(0);
	for (var i = 2; i <= n; i++) {
		z = x + y;
		x = y;
		y = z;
	}
	console.log(z.toString());
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

