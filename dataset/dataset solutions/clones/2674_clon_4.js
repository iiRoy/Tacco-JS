"use strict";

const finalOutcome = ((sourceContent) => {
    const [firstMeasure, secondMeasure, thirdMeasure] = sourceContent.match(/(\d+)/g).map(Number);
    return Math.max(0, secondMeasure + thirdMeasure - firstMeasure);
})(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(finalOutcome);