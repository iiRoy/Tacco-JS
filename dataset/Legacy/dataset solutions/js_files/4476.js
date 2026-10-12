function main(s) {
	s = s.split("\n");
	t = s[0].split(" ").map(x => Number(x));
	l = s[1].split(" ").map(x => Number(x));
	l.sort(x, y => (parseInt(a)>parseInt(b)?-1:1));
	console.log(l);
	var x = 0;
	for (var i = 0; i < t[1]; i++) {x += l[i];}
	console.log(x);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

