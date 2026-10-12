function Main(input) {
	var data = input.split("\n");
	var n = data[0];
	var masu =  data[1].split(" ").map((n) => parseInt(n, 10));
	var max = 0;
	var t = 0;
	for(var i = (n - 1); i>=0; i--){
		console.log(masu[i], masu[i-1])
		if(masu[i] <= masu[i-1]){
			t++;
			if(t>max) max = t;
		}else if(masu[i] > masu[i-1]){
			t = 0;
		}
	}
	console.log(max)
}
 
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));