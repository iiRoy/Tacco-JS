function Main(input) {
	input = input.split("\n");
	square = input[0].split(" ");
	del = input[1].split(" ");
	H = parseInt(square[0]);
	W = parseInt(square[1]);
	h = parseInt(del[0]);
	w = parseInt(del[1]);

	console.log((H*W)-(h*W)-(H*w)+(h*w));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));