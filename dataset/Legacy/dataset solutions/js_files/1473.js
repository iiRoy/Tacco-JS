(function(input){
	input = input.split("\n");
	var data = [];
	var stack = [];
	var index = 0;
	for(var i = 0; i < input.length; i++){
		data[i] = input[i].split(" ");
	}

	index++;

	while(data[index][0] != "quit"){
		switch(data[index][0]){
			case "push":
			if(!(stack[data[index][1]] instanceof Array)){
				stack[data[index][1]] = [];
			}
			stack[data[index][1]].push(data[index][2]);
			index++;
			break;

			case "pop":
			var p = stack[data[index][1]].pop();
			console.log(p);
			index++;
			break;

			case "move":
			if(!(stack[data[index][2]] instanceof Array)){
				stack[data[index][2]] = [];
			}
			var m = stack[data[index][1]].pop();
			stack[data[index][2]].push(m);
			index++;
			break;
		}
	}
})(require("fs").readFileSync("/dev/stdin", "utf8"));