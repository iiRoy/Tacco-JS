var arr = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/);
var xx;
for(var i=0;arr[i]*arr[i+1]!=0;i+=2){
	xx = arr[i]*arr[i];
	console.log(arr[i] * Math.sqrt(4*arr[i+1]*arr[i+1] + xx)+ xx);
}