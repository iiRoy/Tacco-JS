'use strict'

function Main(input) {
  const inputs = input.split('\n');
  const bars = inputs[1].split(' ').sort().reverse();
  const sides = [];

  let result = 0;
  let flag = false;
  for (let i = 0; i < bars.length; i++) {
	const bar1 = bars[i];
    const bar2 = bars[i + 1] ? bars[i + 1] : null;
    const bar3 = bars[i + 2] ? bars[i + 2] : null;
    const bar4 = bars[i + 3] ? bars[i + 3] : null;
    if (bar1 === bar2 && bar1 === bar3 && bar1 === bar4) {
      result = parseInt(bar1 * bar4, 10);
      break;
    }

    if (bar1 === bar2 && !flag) {
      sides.push(bar1);
      flag = true;
    } else {
      flag = false;
    }
    if (sides.length === 2) {
	  result = parseInt(sides[0] * sides[1], 10);
      break;
    }
  }
  console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
