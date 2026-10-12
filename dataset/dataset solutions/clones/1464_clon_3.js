process.stdin.on("data", function(k){
	k = String(k).trim().split("\n");

	var o = {};
	var c = 0;
	var first = k[1].split(" ");
	var second = k[3].split(" ");

	first.forEach(function(a){
		if(a !== ""){
			o[a] = (o[a] || 0) + 1;
		}
	});

	second.forEach(function(a){
		if(o[a]){
			c += o[a];
			o[a] = 0;
		}
	});

	console.log(c);
}).resume();