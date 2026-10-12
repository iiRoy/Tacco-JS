"use strict";
function Main(input) {
  const args = input.split('\n');
  const N = parseInt(args.shift());
  let count = 0;
  let countA = 0;
  let countB = 0;
  let both = false;
  args.forEach(f => {
    count += (f.length - f.replace(/AB/g, '').length) / 2;
    console.log(`count: ${count}`);
    let endB = f.charAt(0) === 'B';
    if (endB) {
      countB ++;
    }
    let startA = f.charAt(f.length - 1) === 'A';
    if (startA) {
      countA ++;
    }
    both = both || (startA && endB);
  });
  count += countA < countB ? countA : countB;
  count += both ? -1 : 0;
  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));