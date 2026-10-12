function main(input) {
  mod = 10000000007;
  hoge = 0;
  baz = input.split("\n");
  N = Number(baz[0]);
  nums = input
    .split("\n")[1]
    .split(" ")
    .map(n => parseInt(n, 10));
  sum = 0;
  factorial = 1;

  for (var i = 1; i < N; i++) {
    sum += nums[i];
    factorial *= i;
  }
  console.log(((sum / (N - 1)) * factorial) % mod);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
