function Main(input){
	input = input.split("");
	var ans = ""
	for(var i=0;i<input.length;i++){
		if(i%2==0) ans += input[i];
	}
  console.log(ans)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
