'use strict'

function Main(input) {
  const inputs = input.split('\n');
  const bars = inputs[1].split(' ').sort().reverse();
  const sides = [];
  let current = 0;
  for (let bar of bars) {
    if (bar === current) continue;
    current = bar;

    const n = bars.filter((b) => bar === b).length;
    if (n >= 4) {
      sides.push(bar);
      sides.push(bar);
      break;
    } else if (n >= 2 && (n != 1 || n != 3)) {
      sides.push(bar);
    }
    if (sides.length === 2) {
      break;
    }
  }
  if (sides.length === 2) {
    console.log(sides[0] * sides[1]);
  } else {
    console.log(0);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
