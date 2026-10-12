function Main(input) {
	input = input.split("\n");
	tmp = input[1].split(" ");
	
	
	var n = parseInt(input[0], 10);
	var a = [];
	
	for (var i = 0; i < n; i++) {
	a.push(parseInt(tmp[i], 10));
	}
	
	b = []
	for (var i = 0; i < a.length; i++) {
	b.push(a[i]);
	b.push(a[i]);
	}	
	
	b.sort(
	function(a,b){
    	return (a < b ? 1 : -1);
	}
	);
	
	var result = b[0];
	for (var i = 2; i < n; i++) {
	result = result + b[i];
    }
  	console.log(result);
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));