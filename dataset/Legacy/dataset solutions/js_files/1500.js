function Main(input) {
  input = input.split("\n").map(v => v.split(" "));
  const n = input[0][0];

  for (let i = 1; true; i++) {
    // x * (x + 1) / 2 = n
    if (((i * (i + 1) / 2) % n) === 0) {
      console.log(i);
      break;
    }
  }
}
// 魔法
Main(require("fs").readFileSync("/dev/stdin", "utf8"));