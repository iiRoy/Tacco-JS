function Main(input){
	input = input.split("\n");
	var sum = 0;
	for(var i=1;i<input.length;i++){
		var mem = input[i].split(" ");
		sum += mem[1]-mem[0]+1;
	}
	console.log(sum)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());