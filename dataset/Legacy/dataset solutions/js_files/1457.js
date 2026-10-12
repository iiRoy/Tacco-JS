process.stdin.on("data",function(c){
	console.log((c+"").trim().split("\n")[1].split(" ").sort().join(" "));
}).resume();