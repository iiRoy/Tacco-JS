'use strict'
const lines = require('fs').readFileSync(0, 'utf8').split('\n')
const str = lines[0]
const n = str.length - 1;
const dfs = (i, sum, order) => {
  if (i === n) return eval(order + str[n]);

  sum += dfs(i + 1, sum, order + str[i] + '+') + dfs(i + 1, sum, order + str[i]);

  return sum;
}

const ans = dfs(0, 0, '');
console.log(ans);