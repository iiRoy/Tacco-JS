// A: Travelling Budget
"use strict";

const DEBUG_MODE = false;
const rawInput = DEBUG_MODE
  ? "600\n300\n220\n420"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const process = inputRaw => {
  const inputs = inputRaw.split("\n").map(input => parseInt(input));

  console.log(
    Math.min.apply(Math, inputs.slice(0, 2)) +
      Math.min.apply(Math, inputs.slice(2, 4))
  );
};

process(rawInput);
