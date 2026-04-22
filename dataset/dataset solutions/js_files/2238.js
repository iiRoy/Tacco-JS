"use strict"
 
function Main(s) {
  s = s.split('\n');
  let n = Number(s[0]);
  const robos = s.slice(1, s.length);
 
  const l = robos.map(robo => {
    let t = robo.split(' ').map(Number);
    return [t[0]-t[1], t[0]+t[1]];
  })
  l.sort((a, b) => a[1] > b[1]);

  let range = [-1e10];
  let cnt=0;
  for(let i=0; i <l.length; ++i){
    const min = l[i][0];
    const max = l[i][1];

    if(Math.max.apply(null, range) <= min) {
      range.push(max);
      cnt++;
    }
  }
 
  console.log(cnt);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));