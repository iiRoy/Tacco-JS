process.stdin.on("data",function(c){
	var a=[],b=[];
	var s=(c+"").trim().split("\n");
	var n=+s.shift();
	for(var i=0;i<n;i++){
		a[i+1]=[];
	}
	s.some(function(n){
		if(n==="quit"){
			return 1;
		}
		if(~n.indexOf("pu")){
			a[+n[5]].push(n[7]);
		}
		else if(~n.indexOf("mo")){
			a[+n[7]].push(a[+n[5]].pop());
		}
		else{
			b.push(a[+n[4]].pop());
		}
	});
	b.forEach(function(a){
		console.log(a);
	});
}).resume();