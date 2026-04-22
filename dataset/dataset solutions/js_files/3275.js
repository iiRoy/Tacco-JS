"use strict";

function main(input) {
  var lines = input.split('\n');
  var N = parseInt(lines[0]);
  var A = splitNum(lines[1]).slice(0, N);
  var B = splitNum(lines[2]).slice(0, N);
  var diffs = A.map(function (a, i) {
    return a - B[i];
  });
  diffs.sort(function (x, y) {
    return y - x;
  });
  var changed = diffs.map(function (_) {
    return false;
  });
  var source = 0;
  var target = N - 1;

  while (source < target) {
    var diff = diffs[target];

    if (diff >= 0) {
      //ok
      break;
    }

    if (diffs[source] >= -diff) {
      changed[source] = true;
      changed[target] = true;
      diffs[source] += diff;
      diffs[target] = 0;
      target--;
    } else {
      if (diffs[source] > 0) {
        changed[source] = true;
        changed[target] = true;
      }

      diffs[target] += diffs[source];
      diffs[source] = 0;
      source++;
    }
  }

  if (diffs[target] < 0) {
    console.log(-1);
  } else {
    console.log(changed.reduce(function (acc, v) {
      return acc + v;
    }, 0));
  }

  return;
}

function gcd(a, b) {
  if (a < b) return gcd(a, b);
  if (b === 0) return a;
  var r = a % b;
  return gcd(b, r);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
    return parseInt(n);
  });
}
