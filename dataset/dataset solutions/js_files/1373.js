process.stdin.on("data",function(c){
	(c+"").trim().split("\n").some(function(s){
		s=s.split(" ");
		var n=+s[0],x=+s[1],r=0;
		if(!n&&!x){
			return 1;
		}
		for(var a=1;a<=n-2;a++){
			for(var b=a+1;b<=n-1;b++){
				for(var c=b+1;c<=n;c++){
					a+b+c==x&&(r++);
				}
			}
		}
		console.log(r);
	});
}).resume();