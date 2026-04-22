'use strict';

function main(input) {
  const arr = input.trim().split('\n');
  const a = arr[0].split(' ').map(x => Number(x));
  const challengers = arr[1].split('');
  const isPass = [];
  let foreigner = 0;

  for (let i = 0; i < challengers.length; i++) {
    if (challengers[i] === 'a') {
      if (i + 1 < a[1] + a[2]) {
        isPass[i] = 'Yes\n';
        continue;
      } else {
        isPass[i] = 'No\n';
      }
    } else if (challengers[i] === 'b') {
      for (let j = 0; j < i; j++) {
        if (challengers[j] === 'b') {
          foreigner++;
        }
      }
      if (i + 1 < a[1] + a[2] && i + 1 < foreigner) {
        isPass[i] = 'Yes\n';
        continue;
      } else {
        isPass[i] = 'No\n';
      }
      foreigner = 0;
    } else {
      isPass[i] = 'No\n';
      continue;
    }
    console.log(isPass[i]);
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));