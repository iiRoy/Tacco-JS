'use strict';
const main = input => {
  const n = parseInt(input[0]);
  let ans = 10000000000000;
  for(let i=1; i<= Math.floor(Math.sqrt(n)); i++) {
    if (n%i == 0) {
      if (ans > i-2+n/i) {
        ans = i-2+n/i;
      }
    }
  }
  console.log(ans);
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));