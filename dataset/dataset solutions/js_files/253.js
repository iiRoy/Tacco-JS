var Input =[];
var arr=[];
Input = require("fs").readFileSync("/dev/stdin", "utf8").split(/,\d+\n{0,}/);
var length = Input.length;
var a;
for(var i=0;i<length;i++){
	a=Input[i];
	if(arr[a]===undefined){
		arr[a]=1;
	}else{
		arr[a]++;
	}
}
lenth = arr.length;
for(i=0;i<lenth;i++){
	if(arr[i]!==undefined&&arr[i]>1)console.log(i+' '+arr[i]);
}