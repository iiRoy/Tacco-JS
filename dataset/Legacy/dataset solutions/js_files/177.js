function sl(n){
	if(n%2===0){
		return 2;
	}
	for(var i=3;i*i<=n;i+=2){
		if(n%i===0){
			return i;
		}
	}
	return n;
}
var a=[2,3];
for(var i=1,l=50024;i*6+1<l;i++){
	var o=i*6-1,p=i*6+1;
	sl(o)===o&&a.push(o);
	sl(p)===p&&a.push(p);
}
var l=a.length;
process.stdin.on("data",function(c){
	(c+"").trim().split("\n").some(function(n){
		n=+n;
		for(var i=0;i<l;i++){
			if(n<a[i]){
				console.log((a[i-1]===n?a[i-2]:a[i-1]),a[i]);
				break;
			}
		}
	});
}).resume();