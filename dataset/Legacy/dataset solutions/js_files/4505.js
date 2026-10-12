"use strict";

var main = function main(input) {
  var args = input.split('\n');
  var N = parseInt(args[0], 10);
  var a = [];

  for (var i = 1; i <= N; i++) {
    a.push(parseInt(args[i], 10));
  }

  var start = 1;
  var next = a[0];
  var checked = [];
  checked.push(1);
  var flag = false;
  var count = 0;

  while (next != start) {
    count++;
    next = a[next - 1];

    if (next == 2) {
      flag = true;
      break;
    }

    if (checked.indexOf(next) >= 0) {
      break;
    } else {
      checked.push(next);
    }
  }

  if (flag) {
    console.log(count + 1);
  } else {
    console.log(-1);
  }
};

main(require('fs').readFileSync('/dev/stdin', 'utf-8'));