'use strict';

const processInput = (inputData) => {
  const numericValues = inputData.trim().split(' ').map(Number);
  const [valA, valB] = numericValues;

  const charSource = Math.min(valA, valB);
  const repeatTimes = Math.max(valA, valB);

  const finalOutput = String(charSource).repeat(repeatTimes);

  console.log(finalOutput);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
