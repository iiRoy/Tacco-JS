"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf-8");

function print(x) {
  console.log(x);
}

let inputString = "";
let currentLine = 0;

process.stdin.on("data", inputStdin => {
  inputString += inputStdin;
});
process.stdin.on("end", () => {
  inputString = inputString.split("\n");
  main();
});
function readline() {
  return inputString[currentLine++];
}

// ************************ Ignore above this Line ******************************
// **************************** Main Code Start *********************************

function main() {

  var ar = readline().split(" ").map(x => parseInt(x));
  var a = ar[0], b = ar[1];

  var Max = Math.max(a, b);
  var Min = Math.min(a, b);

  var div = Math.floor(Max / Min);
  var mul = Math.floor(Max * Min);
  var ok = Math.floor(mul / div);

  print(ok);
  
}
