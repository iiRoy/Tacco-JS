process.stdin.on("data",function(c){
	var s=(c+"").trim().split(" "),a=+s[0],b=+s[1];
	console.log(a/b|0,a%b,+(a/b).toFixed(8));
}).resume();