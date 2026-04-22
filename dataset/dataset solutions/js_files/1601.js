function Main(input) {
  const [x, k, d] = input.trim().split(" ").map((a) => parseInt(a, 10));
  const a = Math.abs(x / d);
  const b = x % d;
  if (Math.abs(x) < d) {
    if (k % 2 === 0) {
      console.log(x);
    } else {
      console.log(x + d);
    }
  } else if (a > k) {
    if (x > 0) {
      console.log(Math.abs(x - k * d));
    } else {
      console.log(Math.abs(x + k * d))
    }
  } else {
    if (k % 2 === 0 && b === 0) {
      console.log(d);
    } else {
      console.log(b);
    }
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
