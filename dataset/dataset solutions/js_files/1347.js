process.stdin.on("data",function(c){
	var n=+c,p=Math.PI;
	console.log(2*n*p,n*n*p);
}).resume();