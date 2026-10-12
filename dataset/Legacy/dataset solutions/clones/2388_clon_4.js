'use strict'
function Main(input) {
  const dayOrder = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDayName = input.split("\n")[0];
  const dayPosition = dayOrder.indexOf(currentDayName);
  const remainingDays = 7 - dayPosition;
  console.log(remainingDays);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
