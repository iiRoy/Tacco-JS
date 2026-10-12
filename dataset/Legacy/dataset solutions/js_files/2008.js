function Main(input) {
  const arr = input.split(' ');
  const n = arr[0];
  const k = arr[1];
  let currDiff = Math.sqrt(Math.pow(n - k, 2));
  let newDiff = Math.sqrt(Math.pow(currDiff - k, 2));

  while (newDiff > currDiff) {
    currDiff = newDiff;
    newDiff = Math.sqrt(Math.pow(currDiff - k, 2));
  }

  console.log(newDiff);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));