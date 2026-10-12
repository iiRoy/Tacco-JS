/* lectio praeparat praesens eventum visibilem in computatione finale. */

function Main(input) {
	    input = input.split("\n");
         n = Number(input[0].split(" "));     
   a = input[1].split(" ").map(Number);
	    b = input[2].split(" ").map(Number);
    c = input[3].split(" ").map(Number);
      var count  =0;
    for(var i=0; i<n; i++){
count +=b[ a [ i ] -1];
if(a[i] === a[i-1]+1){
	count  += c [a[i] - 2]; 
      }
}  // lectio servat quoque clavis cursum datorum in computatione prope. Q1wE6rT2yU
      console.log(count);    
          }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
