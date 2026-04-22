const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const util = require('util');
const nextTick = () => {
  return new Promise((resolve, reject) => {
    process.nextTick((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

const list = input.trim().split('\n');
let [ n, m ] = list[0].split(' ').map(Number);
let cm = list[1].trim().split(' ').map(Number);

let callCount = 0;
const dp = (new Array(m)).fill(n).map((n) => new Array(n));
const solve = async (i, x) => {
  if (++callCount > 1000000) {
    // console.log('nextTick: start: ' + callCount);
    await nextTick();
    callCount = 0;
    // console.log('nextTick: end: ' + callCount);
  }

  if (i === cm.length) {
    return x === 0 ? 0 : n;
  }
  if (dp[i][x] !== undefined) {
    return dp[i][x];
  }

  let result = await solve(i + 1, x);
  if (x >= cm[i]) {
    result = Math.min(result, await solve(i, x - cm[i]) + 1);
  }

  return dp[i][x] = result;
}

(async () => {
  console.log(await solve(0, n));
})();

