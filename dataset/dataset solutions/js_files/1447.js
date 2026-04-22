process.stdin.on("data",function(c){
	var a=(c+"").trim().split("\n"),i=0;
	while(+a[i]){
		var n=+a[i],m=0,x=0,s=a[i+1].split(" ");
		s.forEach(function(b){m+=+b;});
		m/=n;
		s.forEach(function(b){x+=Math.pow(+b-m,2)});
		console.log(Math.sqrt(x/n).toFixed(8));
		i+=2;
	}
}).resume();