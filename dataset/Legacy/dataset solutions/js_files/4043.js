function Main(s) {
	s = s.split("\n");
	var n = s[0];
	var a = s[1].split(" ").map(a => parseInt(a));
	var b = s[2].split(" ").map(a => parseInt(a));
	
	var sa = a.reduce((a,b) => a+b);
	var sb = b.reduce((a,b) => a+b);
	var ab = 0;
	for(var i = 0; i < n; i++){
		ab += Math.ceil(Math.max(b[i] - a[i], 0) / 2);
	}
	console.log(ab <= sb - sa ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());