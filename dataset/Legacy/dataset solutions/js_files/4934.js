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
        isPass[i] = true;
        continue;
      } else {
        isPass[i] = false;
      }
    } else if (challengers[i] === 'b') {
      for (let j = 0; j < i; j++) {
        if (challengers[j] === 'b') {
          foreigner++;
        }
      }
      if (i + 1 < foreigner) {
        isPass[i] = true;
        continue;
      } else {
        isPass[i] = false;
      }
      foreigner = 0;
    } else {
      isPass[i] = false;
      continue;
    }
  }

  for (let i = 0; i < isPass.length; i++) {
    if (isPass[i]) {
      console.log('Yes\n');
    } else {
      console.log('No\n');
    }
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));