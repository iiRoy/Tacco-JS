function Main(input) {
    var data = input.split("\n")
	var n =  data[0].split(" ").map((n) => parseInt(n, 10));
	var num =  data[1].split(" ").map((n) => parseInt(n, 10));
	var junban = new Array(n);
	
	for(var i=1; i <= n[0];i++){
		junban[num[i]] = i;
	}
	console.log(junban.join(' '))
}
 
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));