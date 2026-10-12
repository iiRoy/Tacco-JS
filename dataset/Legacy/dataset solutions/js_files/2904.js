'use strict'
const Main = (arg) => {
  let input = arg.trim().split('\n');
  let AP = input[0].split(' ').map(Number)[0];
  let ap = input[0].split(' ').map(Number)[1];
  // console.log({ AP, ap });

  let Allap = 3 * AP + ap;
  let Answer = Math.floor(Allap / 2);
  console.log(Answer);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
