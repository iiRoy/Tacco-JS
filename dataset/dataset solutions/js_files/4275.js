function Main(input){
	input = input.split("\n").map(Number);
	var now = 1;
	for(var i=0;i<input[0];i++){
		if(now>=input[1]) now += input[1];
		else now *= 2;
	}
	console.log(now)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());