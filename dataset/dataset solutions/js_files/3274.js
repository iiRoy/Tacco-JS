"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf8");

var lines = [];

var reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on("line", line => {
  lines.push(line.split(/\s/).map(x => parseInt(x)));
});

reader.on("close", () => {
  let n = lines.shift();
  let a = lines.shift();
  let b = lines.shift();

  let aSum = a.reduce((a, i) => a + i);
  let bSum = b.reduce((a, i) => a + i);

  if (aSum < bSum) {
    console.log(-1);
    return;
  }
  let count = 0;
  let positiveArr = [];
  let positiveSum = 0;
  let negativeSum = 0;
  let index = 0;

  for (let i = 0; i < n; i++) {
    let tmp = a[i] - b[i];
    if (tmp > 0) positiveArr.push(tmp);
    else {
      count += 1;
      negativeSum += tmp;
    }
  }

  positiveArr.sort((a, b) => b - a);
  while (positiveSum + negativeSum < 0) {
    positiveSum += positiveArr[index];
    index++;
  }

  console.log(count + index);
});
