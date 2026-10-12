process.stdin.on("data",function(c){
	(c+"").trim().split("\n").some(function(a,i){
		if(!+a){
			return;
		}
		console.log("Case",i+1+":",a);
	});
}).resume();