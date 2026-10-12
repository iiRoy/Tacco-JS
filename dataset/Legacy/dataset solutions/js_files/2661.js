'use strict'

function main(input) {
  const lines = input.split('\n');
  lines.pop();
  const n = lines.shift();
  f(lines);
}

function f(lines) {
  const parsed = {}
  lines.forEach(line => {
    const sorted = line.split('').sort().join('');
    if (!!parsed[sorted]) {
      parsed[sorted] += 1;
    } else {
      parsed[sorted] = 1;
    }
  });
  let result = 0;
  Object.keys(parsed).forEach(k => {
    if (parsed[k] >= 2) {
      result = result + (factorial(parsed[k]) / 2);
    }
  });
  console.log(result);
}

function factorial(num) {
  if (num === 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));