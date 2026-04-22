function Main(input) {
	const input = input.split("\n");
	const [n, k] = input[0].split(" ");
    const arr = input[1]
    	.split(" ")
    	.map((str) => Number(str))
    	.sort((a,b) => a < b);
  	let ans = 0;
  	for(let i=0; i < k; i++){
    	ans += arr[i];
    }
	
	console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));