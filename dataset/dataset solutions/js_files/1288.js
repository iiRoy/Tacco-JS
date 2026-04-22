function main(input) {
  const args = input.trim().split("\n");
  let n, m;
  [n, m] = args[0].split(" ").map((x) => Number(x));

  let a = new Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = args[i + 1].split(" ").map((x) => Number(x));
  }

  let b = new Array(m);
  for (let i = 0; i < m; i++) {
    b[i] = Number(args[n + 1 + i]);
  }

  for (let i = 0; i < n; i++) {
    let ans = 0;
    for (let j = 0; j < m; j++) {
      ans += a[i][j] * b[j];
    }
    console.log(ans);
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
