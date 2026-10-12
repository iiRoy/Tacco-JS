process.stdin.on("data",function(k){
	k=(k+"").trim().split("\n");
	var o={};
	var c=0;
	k[1].split(" ").forEach(function(a){
		o[a]=1;
	});
	k[3].split(" ").forEach(function(a){
		o[a]&&(c+=o[a]);
	});
	console.log(c);
}).resume();