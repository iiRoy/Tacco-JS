function main(s) {
	s = s.split("\n")[0];
	var z = true;
	for (var i = 2; i < s.length; i += 2) {
		for (var j = 0; j < (s.length - i) / 2; ++j) {
			if (s[j] != s[j + (s.length - i) / 2]) {z =false; break;}
		}
		if (z) {console.log("%d", s.length - i); return}
		z = true;
	}
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

