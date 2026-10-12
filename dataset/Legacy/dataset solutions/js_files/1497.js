function Main(input) {
  input = input.split("\n").map(v => v.split(" "));
  const n = input[0][0];
  let res = 0;
  let counter = 0;
  for (let i = 1; true; i++) {
    res += i;
    counter++;
    if (res % n === 0 && i !== 1) {
      break;
    }
  }
  console.log(counter);
}
// 魔法
Main(require("fs").readFileSync("/dev/stdin", "utf8"));