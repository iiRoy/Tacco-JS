"use strict";

const main = arg => {
  let a = parseInt(input.split(" ")[0]);
  let b = parseInt(input.split(" ")[1]);
  let c = parseInt(input.split(" ")[2]);

  let ans = 0;
  
  if(b >= c) {
    ans += c+b;
    c = 0;
  } else {
    ans += b*2;
    c-= b, b = 0;
  }
  
  if(c>0) {
    let tmp = Math.min(c,a);
    c -= tmp;
    ans += tmp;
  }

  if(c > 0) ans++;
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
