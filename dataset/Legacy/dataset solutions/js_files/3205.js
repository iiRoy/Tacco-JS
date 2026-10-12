const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.split(' ');

const k = Number(list[0]);

const a = Number(list[1]);

const b = Number(list[2]);

const output = () => {
  if (k < a + 1) {
    console.log(k + 1);
  } else if (b <= a + 2) {
    console.log(k + 1);
  } else if ((k - a + 1) % 2 === 0) {
    console.log(a + (b - a) * (k - a + 1) / 2);
  } else {
    console.log(a + (b - a) * (k - a) / 2 + 1);
  }
};

output();
