// C: Base -2
"use strict";

const DEBUG_MODE = false;
const rawInput = DEBUG_MODE
  ? "-9"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const process = inputRaw => {
  let input = parseInt(inputRaw);
  let result = "";

  while (input !== 0) {
    let remainder = input % -2;
    input = ~~(input / -2);

    if (remainder < 0) {
      remainder *= -1;
      input += 1;
    }

    result = Number(remainder).toString() + result;
  }

  console.log(result);
};

process(rawInput);
