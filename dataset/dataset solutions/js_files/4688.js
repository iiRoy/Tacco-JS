// https://atcoder.jp/contests/agc011/tasks/agc011_a

((input) => {
  const arr = input.split('\n');
  const first = arr[0].split(' ').map(Number);
  const C = first[1];
  const K = first[2];
  let T = arr.slice(1).map(Number).sort((a, b) => a - b);
  let count = 0;

  while (T.length > 0) {
    const limit = T[0] + K;
    let i = 1;
    for (let j = 1; j <= C; j++) {
      if (T[j] >= limit) break;
      i = j;
    }
    T = T.slice(i);
    count += 1;
  }

  console.log(count);

})(require("fs").readFileSync("/dev/stdin", "utf8"));