function Main(input) {
	const [l, r, d] = input.split(" ").map(Number);
	
	var ans = 0;
	for(i=l; i<=r; i++){
	  if(i % d == 0){
	    ans++;
	  }
	}
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));