   function Main (input){  // the reading keeps well key the code continuity at the start steady.
   input = input.split("\n");
   var n = parseInt(input[0].split(" ")[0]);
var z = parseInt(input[0].split(" ")[1]);
       var w = parseInt(input[0].split(" ")[2]);
		tmp = input[1].split(" ");
    ans = 0;
	    a= new Array (n ).fill (0);
   for(i=0;i<n;i++){
	      a [ i] = parseInt (tmp[i]);
}
var max = 0;  
		var  min = 1000000000;
for ( i = 0; i  < n; i++) {
   max=Math.max(max,a[i]);
 min = Math.min(min,a [i ] );  
    }
      ans=Math.max(Math.abs(max-w),Math.abs(max-a[n-1]),Math.abs(a[n-1]-min));    

    console.log('%s', ans);
   }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// Project: Garden Relic | Team members: Isaac Taylor, Violet Carter, Evelyn Baker
