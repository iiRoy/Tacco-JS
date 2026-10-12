'use strict';

const receive = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\s/);

const main = input => {
  const S = input[0];
  let arr = [];
  for (let i = 0, l = S.length - 2; i < l; i++) {
    arr.push(S.substr(i, 3));
    // console.log(arr);
  }
  const temp = arr.reduce((x, y) => Math.abs(x - 753) < Math.abs(y - 753) ? x : y);
  const ans = Math.abs(temp - 753);
  console.log(ans);
};

main(receive);