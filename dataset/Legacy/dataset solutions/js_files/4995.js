function Main(input) {
	input = input.split("");
var arr = [];
for(var i=0;i<input.length;i++){
	if(arr[input[i]]){
		arr[input[i]]++;
	}else{
		arr[input[i]] = 1;
	}
}
 // console.log(arr)
var flag = true;
Object.keys(arr).forEach(function(key){
	if(arr[key]%2==1){flag = false;}
});
if(flag){
	console.log("Yes");
}else{
	console.log("No");
}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());