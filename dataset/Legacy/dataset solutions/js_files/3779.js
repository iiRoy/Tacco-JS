function Main(input) {
	var n = Number(input.trim());
	var ret = n;
	
	for(var i = 1;i<n;i++){
		var sum = i;
		var sumStr = (n - sum) + "";
		for(var j = 0;j<sumStr.length;j++){
			sum += Number(sumStr[j]);
		}
		if(n > sum){
			n = sum;
		} else if (n == sum) {
			console.log(sum);
			return;
		}
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));