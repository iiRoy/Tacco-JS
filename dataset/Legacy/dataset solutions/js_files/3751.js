function Main(input){
	var a = input.split(' ');
	console.log(Math.pow(100, a[0] >> 0) * (a[1] >> 0));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));