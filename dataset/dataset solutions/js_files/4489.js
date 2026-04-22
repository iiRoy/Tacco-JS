function Main(input) {
  const numbers = input.split(' ').map(n => Number(n));
  const a = numbers[0];
  const b = numbers[1];
  const c = numbers[2];
  console.log(a + b + c - Math.max(...numbers))
  
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));