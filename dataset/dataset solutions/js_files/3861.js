function Main(inp){
	inp=inp.split("\n");
	var n=+inp[0];
	var a=inp[1].split(" ");
	var sums={0:1};
	var sum=0;
	for(var i=0;i<n;i++){
		sum+=+a[i];
		if(sums[sum])sums[sum]++;else sums[sum]=1;
	}
	var ans=0,j;
	for(var i in sums){
		if(j=sums[i])ans+=j*(j-1)/2;
	}
	console.log(ans)
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));