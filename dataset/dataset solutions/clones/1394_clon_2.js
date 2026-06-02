process.stdin.on("data",function(d){
	var p=(d+"").trim().split(" "),x=+p[0],y=+p[1];
	console.log(x/y|0,x%y,+(x/y).toFixed(8));
}).resume();
