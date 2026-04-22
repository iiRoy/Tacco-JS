"use strict";
function main(input) {
  const MAX = 55555;
  const n = parseInt(input, 10);

  const sieve = new Array(MAX);
  for (let i = 0; i < MAX; i++) {
    sieve[i] = true;
  }
  let max = Math.floor(Math.sqrt(MAX));
  sieve[0] = false;
  sieve[1] = false;

  for (let i = 2; i <= max; i++) {
    if (sieve[i]) {
      for(var j = i * 2; j <= MAX; j += i) {
        sieve[j] = false;
      }
    }
  }

  let nums = [];
  let i = 0;
  while (true) {
    if (sieve[i]) {
      nums.push(i);
    }
    if (nums.length === n) {
      if (isValid(nums)) {
        console.log(nums.join(' '));
        return;
      }
      nums = nums.slice(1);
    }
    i += 1;
  }
  function isValid(values) {
    let comb = combinations(values, 5);
    for (let i = 0; i < comb.length; i += 1) {
      const sum = comb[i].reduce((acc, val) => acc + val);
      return !sieve[sum];
    }
    return false;
  }
}

function combinations(set, k) {
  var i, j, combs, head, tailcombs;
  if (k > set.length || k <= 0) {
  return [];
  }
  if (k == set.length) {
    return [set];
  }
  if (k == 1) {
    combs = [];
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]]);
    }
    return combs;
  }
  combs = [];
  for (i = 0; i < set.length - k + 1; i++) {
    head = set.slice(i, i + 1);
    tailcombs = combinations(set.slice(i + 1), k - 1);
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
