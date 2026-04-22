"use strict";
function main(input) {
  let a = input[0].split(" ");
  a = a[1];
  let n = input[1].split(" ");
  
  let max = 0;
  for(let i=a-1;i<n.length;i++){
    let max_n = 0;
    for(let j=0;j<a;j++){
      for(let k=1;k<=n[i-j];k++){
        max_n += k / n[i-j];
      }
    }
    if(max_n > max){
      max = max_n;
    }
  }
  console.log(max);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));