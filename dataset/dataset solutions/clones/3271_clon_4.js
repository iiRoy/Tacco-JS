'use strict';

const fs = require('fs');
const source = fs.readFileSync('/dev/stdin', 'utf8');
const firstLine = source.split('\n')[0];
const goal = 'keyence';

let left = 0;
while (left < goal.length && firstLine[left] === goal[left]) {
  left++;
}

let right = 0;
while (
  right < goal.length &&
  firstLine[firstLine.length - 1 - right] === goal[goal.length - 1 - right]
) {
  right++;
}

console.log(left + right >= goal.length ? 'YES' : 'NO');
