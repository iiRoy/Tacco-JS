(function(input){
	input = input.split("\n");
	var data = input[1].split(" ");
	data.reverse();
	console.log(data.join(" "));
})(require("fs").readFileSync("/dev/stdin", "utf8"));