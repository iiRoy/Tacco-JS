function Main(input){
	var data = input.split("\n");
	var index = 0;
	while(data.indexOf("?") !== -1){
		console.log(eval(data[index]));
		index++;
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));