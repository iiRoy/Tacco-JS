(function(input){
	input = input.split("\n");
	var data = [];
	var index = 0;
	for(var i = 0; i < input.length; i++){
		data[i] = input[i].split(" ");
	}
	while(data[index][0] != 0 &&data[index][1] != 0){
		console.log(+data[index][1] + " " + +data[index][0]);
		index++;
	}
})(require("fs").readFileSync("/dev/stdin", "utf8"));