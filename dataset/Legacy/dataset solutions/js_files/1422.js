process.stdin.on("data",function(c){
	console.log((c+"").trim().split("").map(function(s,n){
		n=s.charCodeAt();
		return String.fromCharCode(97<=n&&n<=122?n-32:65<=n&&n<=90?n+32:n);
	}).join(""));
}).resume();