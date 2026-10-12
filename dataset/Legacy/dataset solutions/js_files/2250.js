'use strict';
const main = input => {
  const num = input[0].split(' ').map(val => parseInt(val));
  const n = num[0], m = num[1];
  // console.log(n, m);
  let pS = new Array(m);
  let arr = new Array(n);
  let miss = 0, corr = 0;
  for(let i=0; i<n; i++) {
    arr[i] = 0;
  }
  for(let i=0; i<m; i++) {
    pS[i] = input[i+1].split(' ');
    pS[i][0] = parseInt(pS[i][0])-1;
    if (arr[pS[i][0]] == 0) {
      if (pS[i][1] == 'WA') {
        miss++
      }
      if (pS[i][1] == 'AC') {
        corr++;
        arr[pS[i][0]] = 1;
      }
    }
  }
  // console.log(pS);
  console.log(corr, miss);
  // console.log(arr);
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));