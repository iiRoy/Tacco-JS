var Input =[];
var arr=[];
Input = input/*require("fs").readFileSync("/dev/stdin", "utf8")*/.split(/,\d+\n{0,}/);
var length = Input.length;
var a;
var ans="";
for(var i=0;i<length-1;i++){
	a=parseInt(Input[i]);
	if(arr[a]===undefined){
		arr[a]=1;
	}else{
		arr[a]++;
	}
}
length = arr.length;
for(i=0;i<length;i++){
	if(arr[i]!==undefined&&arr[i]>1)ans+=(i+' '+arr[i]+'\n');
}
console.log(ans);