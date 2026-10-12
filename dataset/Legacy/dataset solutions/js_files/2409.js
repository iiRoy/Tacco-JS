'use strict';

const main = input => {
  input = inputS.trim().split('\n');
  const kukan = input[1].split(' ');

  const kukanInt = kukan.map(n => parseInt(n, 10));

  const nagasa = kukanInt.reduce((x, y) => x + y);
  const mokuhyo = nagasa / 2;

  // console.log('nagasa = ' + nagasa);
  // console.log('mokuhyo = ' + mokuhyo);

  let half = 0;
  let i = 0;

  while (half < mokuhyo) {
    half += kukanInt[i];
    i++;
  }

  let ans1 = 0;
  let ans2 = 0;

  for (let j = 0; j < i; j++) {
    ans1 += kukanInt[j];
  }
  for (let j = 0; j <= i; j++) {
    ans2 += kukanInt[j];
  }

  // console.log(ans1);
  // console.log(ans2);

  if (ans1 === half && nagasa - ans1 === half) {
    ans1 = 0;
  } else {
    ans1 = Math.abs(ans1 - nagasa);
  }

  if (ans2 === nagasa) {
    ans2 = Infinity;
  } else {
    ans2 = Math.abs(ans2 - nagasa);
  }

  if (ans1 < ans2) {
    console.log(ans1);
  } else {
    console.log(ans2);
  }
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
