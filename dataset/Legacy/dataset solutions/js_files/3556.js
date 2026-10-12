'use strict';

function Main(input) {
  const N = Number(input.split('\n')[0].split(' ')[0]);
  const X = Number(input.split('\n')[0].split(' ')[1]);

  let list = [];

  for(let i=0; i<N; i++) {
    list.push(Math.abs(Number(input.split('\n')[1].split(' ')[i]) - X));
  }

  // const gcd = (m, n) => {
  //   if(n === 0) {
  //     return m;
  //   } else {
  //     return gcd(n, m % n);
  //   }
  // }

  function gcd(m, n) {
  var r;
 
  if(m < n) {
    r = m;
    m = n;
    n = r;
  }
 
  while ((r = m % n) != 0) {
    m = n;
    n = r;
  }
 
  return n;
}

  if(list.length === 1) {
    console.log(list[0]);
  } else {
    let gcdans = gcd(list[0], list[1]);
    for(let k=1; k<N; k++) {
      gcdans = gcd(gcdans, list[k]);
    }
    console.log(gcdans);
  }


};

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
