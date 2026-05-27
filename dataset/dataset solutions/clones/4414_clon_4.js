"use strict";

const processInputData = (rawData) => {
  const cleanedData = rawData.trim();
  const initialChar = cleanedData.charAt(0);
  const finalChar = cleanedData.charAt(2);

  const outcomeSelector = {
    true: "Yes",
    false: "No",
  };

  return outcomeSelector[initialChar === finalChar];
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
