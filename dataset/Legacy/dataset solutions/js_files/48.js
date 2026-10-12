process.stdin.on("data",function(c){
	var x=(c+"").trim().split("\n"),n=+x[0],a=[];
	while(a[n]=n--);
	x.slice(2).some(function(s,p){
		s=s.split(",");
		p=a[+s[0]];
		a[+s[0]]=a[+s[1]];
		a[+s[1]]=p;
	});
	a.slice(1).some(function(a){
		console.log(a);
	});
}).resume();