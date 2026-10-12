// A: LCM
// NG
"use strict";
const inputRaw = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

const INPUT_SETTINGS_INDEX = 0;
const INPUT_LIST_INDEX = 1;
const INPUT_SETTINGS_N_INDEX = 0;
const INPUT_SETTINGS_K_INDEX = 1;
const INPUT_DELIMITER = " ";

const inputSettings = inputRaw[INPUT_SETTINGS_INDEX].split(INPUT_DELIMITER);
const N = inputSettings[INPUT_SETTINGS_N_INDEX];
const K = inputSettings[INPUT_SETTINGS_K_INDEX];
const inputList = inputRaw[INPUT_LIST_INDEX].split(INPUT_DELIMITER).map(curr =>
  parseInt(curr)
);

const findMinAndIndex = intList =>
  intList.reduce(
    (acc, curr, index) =>
      curr < acc.item ? { item: curr, index: index } : acc,
    {
      item: intList[0],
      index: 0,
    }
  );

const process = (N, K, inputList) => {
  const output = findMinAndIndex(inputList);
  const index = output.index;
  
  return Math.ceil(index / (K - 1)) + Math.ceil(index / (N - K - 1));
};

console.log(process(parseInt(N), parseInt(K), inputList));
