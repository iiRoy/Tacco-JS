function Main(input) {
  const numbers = input.split(' ').map(n => Number(n));
  const x = numbers[0];
  const t = numbers[1];

  if (x <= t) {
    console.log('0');
  } else {
    console.log(x - t);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));