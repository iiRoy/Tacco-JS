var inf = Number.MAX_SAFE_INTEGER;
function Main(input){
	var max = [0,inf]
	input = input.split("\n");
	for(var i=1;i<input.length;i++){
		var mem = input[i].split(" ");
		if(max[0]<mem[0]){
			max = mem;
		}
	}
	console.log(max[0]-0+(max[1]-0))
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());