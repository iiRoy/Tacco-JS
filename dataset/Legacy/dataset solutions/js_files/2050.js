function Main(input){
	input = input.split("\n");
	var arr = input[1].split(" ").map(Number)
	var m = new Array(20010).fill(0);
	for(var i=0;i<arr.length;i++){
		m[arr[i]]++;
	}
	var sum = 0
	for(i=0;i<m.length;i++){
		var n = m[i]*(m[i]-1)/2;
		sum += n;
		s[i] = n;
	}
	for(i=0;i<arr.length;i++){
		console.log(sum-m[arr[i]]+1);
	}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
