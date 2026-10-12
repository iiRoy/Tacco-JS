const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

const a = nums[0];
const b = nums[1];
const c = nums[2];

if (a === b && b === c && a % 2 === 0) {
  console.log(-1);
} else {
  let x = Math.abs(a - b);
  let y = Math.abs(b - c);
  let z = Math.abs(c - a);

  function twos(n) {
    if (n === 0) return 60;

    let cnt = 0;
    while (n % 2 === 0) {
      n = n / 2;
      cnt++;
    }
    return cnt;
  }

  if (a % 2 !== 0 || b % 2 !== 0 || c % 2 !== 0) {
    console.log(0);
  } else {
    console.log(Math.min(twos(x), twos(y), twos(z)));
  }
}