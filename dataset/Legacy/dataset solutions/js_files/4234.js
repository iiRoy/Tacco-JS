function main(s) {
	s = s.split("\n")[0].split(" ").map(x => Number(x));
	console.log(Math.floor((s[0]-s[2])/(s[1]+s[2])));
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

