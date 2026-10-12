'use strict'
function Main(input) {

  const tmp = input.split("\n");
  let Arr = tmp[0].split(" ").map(Number);

  // console.log({ Arr });
  let CountCoin = 0;
  if (Arr[0] === Arr[1]) {
    CountCoin = Arr[0] + Arr[1];
  } else if (Arr[0] < Arr[1]) {
    CountCoin = Arr[1] + Arr[1] - 1;
  } else if (Arr[0] > Arr[1]) {
    CountCoin = Arr[0] + Arr[0] - 1;
  }

  console.log(CountCoin);


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));