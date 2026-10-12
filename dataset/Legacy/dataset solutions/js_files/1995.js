
"use strict";

const main = arg => {
    var count = 0
  const input = arg.trim().split("\n");
  const N = parseInt(input[0].split(" ")[0]);
  const K = parseInt(input[0].split(" ")[1]);

  var a = K;
  for (var s = 1;s<=N;s++){
      a *= K;
  }
  console.log(a);


     for(var i = 1;i <= a;i++){
    for(var j = 1;j <= a;j++){
     for(var k = 1;k <= a;k++){
        count+=gcd(i,j,k);   
  }
  }
  }
  console.log(count/10000000007);
}
 
function gcd() {
    var f = (a, b) => b ? f(b, a % b) : a
    var ans = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
        ans = f(ans, arguments[i]); 
    }
    return ans 
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));