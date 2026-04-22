var arr = require("fs").readFileSync("/dev/stdin", "utf8").split(/\n/);
var length = arr.length;
var x=[],y=[];
var h,b;
for(var i=0;i<length;i+=2){
	h=0;b=0;x = arr[i].trim().split(/\s/);y = arr[i+1].trim().split(/\s/);
	for(var j=0;j<4;j++){
		if(x[j]==y[j])h++;
		else{
			for(var k=0;k<4;k++){
				if(x[j]==y[k])b++;
			}
		}
	}
	console.log(h+' '+b);
}