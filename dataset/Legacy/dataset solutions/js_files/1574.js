function Main(input) {
	input = input.split("\n");
	tmp = input[0].split("");
	
	var len = tmp.length;
	for (var i = 0; i < len; i++) {
	tmp[i] = parseInt(tmp[i], 10);
	}
	
	var sum = 0;
	var len = tmp.length;
	for (var i = 0; i < len; i++) {
	sum += tmp[i];
	}
	
	if  (sum % 9 == 0) {
	var result = "Yes";
	} else {
	var result = "No";
	}
	
	console.log(result);
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));