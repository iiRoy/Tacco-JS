"use strict";

const processSequence = (rawData) => {
  const [firstLineContent, secondLineContent] = rawData.trim().split("\n");
  const sequenceLength = Number(firstLineContent);
  const numericValues = secondLineContent.split(" ").map(Number);

  const [totalAdjustment, _] = numericValues.slice(1).reduce(
    (accumulator, currentVal) => {
      const [currentSum, lastEffectiveVal] = accumulator;

      if (lastEffectiveVal > currentVal) {
        const requiredIncrease = lastEffectiveVal - currentVal;
        return [currentSum + requiredIncrease, lastEffectiveVal];
      } else {
        return [currentSum, currentVal];
      }
    },
    [0, numericValues[0]]
  );

  console.log(totalAdjustment);
};

processSequence(require("fs").readFileSync("/dev/stdin", "utf-8"));
