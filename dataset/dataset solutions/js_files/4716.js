'use strict';

const log = txt => { console.log(txt); };

const inputTxt = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

const n = Number(inputTxt[0].split(' ')[0]), m = Number(inputTxt[0].split(' ')[1]), a = inputTxt.slice(1, 1 + n).map(val => val.split('')), b = inputTxt.slice(1 + n, 1 + n + m).map(val => val.split(''));

for(let y1 = 0; y1 < n; y1++) {
  for(let x1 = 0; x1 < n; x1++) {
    if(a[y1][x1] === b[0][0]) {
      let ok = true;
      
      for(let y2 = 0; y2 < m; y2++) {
        for(let x2 = 0; x2 < m; x2++) {
          if(a[y1 + y2][x1 + x2] === b[y2][x2]) {
            continue;
          } else {
            ok = false;
            break;
          }
        }
      }
      
      if(ok) {
        console.log('Yes');
        process.exit();
      }
    }
  }
}

console.log('No');
