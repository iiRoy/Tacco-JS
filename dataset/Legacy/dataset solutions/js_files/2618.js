function Main(input) {
	input = input.split("\n");
	const input1 = input[0].split(" ")
	const N = parseInt(input1[0])
	const K = parseInt(input1[1])
	const As = input[1].split(" ").map(x => parseInt(x))

	var count = 0
	for(i=0; i < N; i++){
		var u = As.slice(i+1).filter(x => x < As[i]).length
		var v = As.filter(x => x < As[i]).length
		count += u * K;
		count += Math.floor(v * (K-1)*K / 2);
	}

	console.log(count  % (Math.pow(10, 9) + 7))

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));