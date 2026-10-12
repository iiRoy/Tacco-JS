"use strict";
function main(input) {
  const inputs = input[0].trim().split(" ").map(i => parseInt(i));
  const n = inputs[0];
  const x = inputs[1];
  const y = inputs[2];

  let distances = [];
  for(let i=0;i<n-1;i++){
    distances[i] = 0;
  }

  for(let i=1;i<=n;i++){
    for(let j=i+1;j<=n;j++){
      let distance = Math.min(Math.abs(j-i), Math.abs(x-i)+Math.abs(y-j)+1);
      distances[distance-1]++;
    }
  }
  for(let i=0;i<n-1;i++){
    console.log(distances[i]);
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));