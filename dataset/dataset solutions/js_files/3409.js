const fs = require('fs');

const main = (input) => {
  const tail = input.slice(1).map(Number);

  const max = Math.max(...tail);

  console.log(tail.reduce((acc, x) => {
    if (!acc.flag && x === max) {
      return { sum: acc.sum + x / 2, flag: true };
    } else {
      return { flag: acc.flag, sum: acc.sum + x };
    }
  }, { flag: false, sum: 0 }).sum);
};

main(fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
