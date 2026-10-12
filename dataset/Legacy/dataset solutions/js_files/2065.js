function Main(input) {
	var id = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51";
	var tmp = id.split(",");
	console.log(parseInt(tmp[input-1]));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));