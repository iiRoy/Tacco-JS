function Main(input) {
	var num = input.split(" ");
	for(var n=0; n<num.length; n++){ num[n]=parseInt(num[n]); }
	var output;
  	var count = 0;

 for(i=0;i<num[0];i++){
	if(num[i+2]="JPY"){
		count=num[i+1]+count;
	}else{
		count=num[i+3]*380000+count;
	}
   i=i+1;
   output=count
 }
	//出力
	console.log(output);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));