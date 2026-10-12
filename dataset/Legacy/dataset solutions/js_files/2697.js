function Main(input) {
	input = input.split("\n");
    var N = input[0];
	var vals = input[1].split(" ").map(Number);
	var org = input[1].split(" ").map(Number);
  
  	var count = 0;
  	vals.sort();
  	for(var i=0; i<N; i++)
    {
      if( vals[i] !== org[i] ) count++;
    }
  
  	var ans = (count<=2) ? "YES" : "NO";
  	//出力
	console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));