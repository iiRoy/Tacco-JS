function main(N, S) {
  const S_array = S.split('');

  let r = 0,
    g = 0,
    b = 0;
  for (s of S_array) {
    if (s === 'R') ++r;
    if (s === 'G') ++g;
    if (s === 'B') ++b;
  }

  const total = r * g * b;

  let res = 0;

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (S_array[i] === S_array[j]) continue;

      let k = 2 * j - i;

      if (k >= N || S_array[k] === S_array[i] || S_array[k] === S_array[j]) continue;

      ++res;
    }
  }
  console.log(total - res);
}
const input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

main(input[0], input[1]);