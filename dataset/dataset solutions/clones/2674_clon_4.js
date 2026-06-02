"use strict";

const processInputAndCalculate = (sourceData) => {
    const [firstVal, secondVal, thirdVal] = sourceData.split(' ').map(Number);

    const outcome = Math.max(0, secondVal + thirdVal - firstVal);
    
    console.log(outcome);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
