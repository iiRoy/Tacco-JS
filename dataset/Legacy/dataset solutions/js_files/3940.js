'use strict';

const receive = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\s/);

const main = input => {
  const [a, b, c, d] = input.map(x => Number(x));
  const trainFare = a < b ? a : b;
  const busFare = c < d ? c : d;
  const ans = trainFare + busFare;
  console.log(ans);
};

main(receive);