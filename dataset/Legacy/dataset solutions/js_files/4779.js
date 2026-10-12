'use strict'

function main(s) {
  s = s.split('\n')[0].split(' ').map(n => Number(n));
  
  const K = s[0];
  const S = s[1];
  let counter = 0;

  for (let x = 0; x <= K; x++) {
    for (let y = 0; y <= K; y++) {
      const z = S - x - y;
      if (z < 0 || z > K) continue;
      
      if ((x + y + z) === S) {
        counter += 1;
      }
    }
  }

  console.log(counter);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
