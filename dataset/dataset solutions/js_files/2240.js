"use strict"

function Main(s) {
  s = s.split('\n');
  let n = Number(s[0]);
  const robos = s.slice(1, s.length);

  const sort = robos.sort((a, b)=> Number(a.split(' ')[0]) < Number(b.split(' ')[0]) ? -1:1);

  let range = [];
  for(let i=0; i <robos.length; ++i){
    const x = Number(sort[i].split(' ')[0]);
    const l = Number(sort[i].split(' ')[1]);
    const min = x-l;
    const max = x+l;

    if(Math.max(null, range) >= min) {
      range.push(min, max);
      n=n-1;
    }
  }

  console.log(n);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));