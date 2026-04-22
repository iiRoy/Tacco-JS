(function(input){
	input = input.split("\n");
	var data = input.split(" ");
	data[1].reverse();
	data[1].join(" ");
	console.log(data[1]);
})(require("fs").readFileSync("/dev/stdin", "utf8"));