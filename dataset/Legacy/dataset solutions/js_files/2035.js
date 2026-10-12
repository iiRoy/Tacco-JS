"use strict";
function main(input) {
  const kari = input[0].trim().split(" ").map(i => parseInt(i));
  let p = input[1].trim().split(" ").map(i => parseInt(i));
  let q = input[2].trim().split(" ").map(i => parseInt(i));
  let r = input[3].trim().split(" ").map(i => parseInt(i));

  const x = kari[0];
  const y = kari[1];
  const a = kari[2];
  const b = kari[3];
  const c = kari[4];

  p.sort(function(a, b) {
    return b - a;
  });
  p=p.slice(0,x);
  q.sort(function(a, b) {
    return b - a;
  });
  q=q.slice(0,y);
  r.sort(function(a, b) {
    return b - a;
  });
  r=r.slice(0,x+y);

  let preresult = p.concat(q);
  preresult.sort(function(a, b) {
    return b - a;
  });

  for(let i=0;i<r.length;i++){
    for(let j=0;j<preresult.length;j++){
      if(r[i]>preresult[j]){
        preresult[j]=r[i];
        break;
      }
    }
  }

  let sum = 0;
  for(let i=0;i<preresult.length;i++){
    sum += preresult[i];
  }
  console.log(sum);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));