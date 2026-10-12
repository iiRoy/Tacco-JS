function Main(input) {
	var data = input.split(" ")
	var r1 = parseFloat(data[0])
	var r2 = parseFloat(data[1])
	var r3 = 1 / (1 / r1 + 1 / r2)
	console.log(r3)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
