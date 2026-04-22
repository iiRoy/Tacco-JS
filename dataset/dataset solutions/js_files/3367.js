function Main(input) {

	console.log((input.match(/2/g) === null) ? 0 : input.match(/2/g));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));