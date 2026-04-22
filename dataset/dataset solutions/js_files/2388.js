'use strict'
function Main(input) {
  const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const days = [7, 6, 5, 4, 3, 2, 1];
  let today = input.split("\n")[0];
  // console.log({ today });

  let num = week.indexOf(today);
  console.log(days[num]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));