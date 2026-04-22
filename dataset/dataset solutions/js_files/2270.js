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

  for (var i = N - 1; 0 < i; i--) {
    sum += nums[i];
  }
  sum /= N - 1;
  poke = 1;
  for (var j = 1; j < N; j++) {
    poke *= j;
  }
  console.log((sum * poke) % mod);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
