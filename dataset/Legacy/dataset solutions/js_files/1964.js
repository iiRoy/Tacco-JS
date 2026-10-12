function Main(inputs) {
　　const inputlines = inputs.split("\n");
　　const limit = inputlines[0].split(" ").map(x => parseInt(x,10));
　　const inputvalues = inputlines[1].split(" ").map(x => parseInt(x,10));
	
　　var sum  = function(arr) {
　　　var sum = 0;
　　　arr.forEach(function(elm) {
　　　　　sum += elm;
　　　});
　　　return sum;
　　};
  
　　let total = limit[0] - sum(inputvalues);
  
　　console.log(total>=0?total:-1);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));