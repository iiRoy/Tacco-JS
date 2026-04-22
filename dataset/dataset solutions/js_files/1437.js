process.stdin.on("data",function(c,s){
	s=(c+"").trim().split(" ");
	console.log(Math.sqrt(Math.pow(s[0]+s[2],2)+Math.pow(s[1]+s[3],2)).toFixed(8));
}).resume();