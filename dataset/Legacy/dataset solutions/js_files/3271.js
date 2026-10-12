"use strict";

function main(input) {
  var lines = input.split('\n');
  var str = lines[0];
  var length = str.length;

  for (var start = 0; start < length; start++) {
    for (var end = start; end <= length; end++) {
      var s = str.slice(0, start) + str.slice(end);

      if (s === 'keyence') {
        console.log('YES');
        return;
      }
    }
  }

  console.log('NO');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
    return parseInt(n);
  });
}
