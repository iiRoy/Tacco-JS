function Main(input) {
	input = input.split("");
	var arr = ["C","O","D","E","F","E","S","T","I","V","A","L","2","0","1","6",];
	var sum = 0;
	for(var i=0;i<input.length;i++){
		if(input[i]!=arr[i]) sum++;
	}
	console.log(sum)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());