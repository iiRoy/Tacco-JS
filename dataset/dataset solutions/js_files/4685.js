// https://atcoder.jp/contests/agc011/tasks/agc011_a

((input) => {
  const arr = input.split('\n');
  const [N, C, K] = arr[0].split(' ').map(Number);
  let T = arr.slice(1).map(Number).sort((a, b) => a - b);
  let count = 1;

  for (let i = 0, j = 0; j < N - 1; i++) {
    const limit = T[j] + K;
    if (T[i] >= limit || i === C) {
      count += 1;
      j = i;
    }
  }

  console.log(count);

})(require("fs").readFileSync("/dev/stdin", "utf8"));