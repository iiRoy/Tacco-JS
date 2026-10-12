process.stdin.on("data",function(c){
	(c+"").trim().split("\n").some(function(s,m,f,r,x){
		s=s.split(" "),m=+s[0],f=+s[1],r=+s[2],x=m+f;
		if(!~m&&!~f&&!~r){
			return 1;
		}
		console.log(!~m||!~f?"F":80<=x?"A":65<=x?"B":50<=x?"C":30<=x?50<=r?"C":"D":"F");
	});
}).resume();