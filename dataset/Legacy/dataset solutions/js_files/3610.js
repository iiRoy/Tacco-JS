// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.
	input = input.split("\n");
	// convert string from integer using "parseInt"
	var a = input[0];
	var b = parseInt(input[1], 10);
	var p = 0;
	var N = 5*Math.pow(10,15);
	for (var i = 0; i < a.length; i++) {
		p+=Math.pow(a[i], N);
		if(b<=p){
			console.log('%d',a[i]);
			break;
		}
	}

	//output
	
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));