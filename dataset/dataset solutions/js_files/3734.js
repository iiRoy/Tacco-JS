function Main (input) {
  const inputs = input.split(/\s/g).filter(v => v).map(v => parseInt(v, 10));
  const range = inputs[1];
  const arrLength = inputs[0];
  console.log(range === arrLength ? 1 : arrLength / (range - 1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
