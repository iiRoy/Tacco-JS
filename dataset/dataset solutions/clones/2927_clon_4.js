"use strict";

(function () {
  const processInputAndCompute = (rawData) => {
    const dataLines = rawData.split("\n");
    const firstLineContent = dataLines[0];

    const numericTokens = firstLineContent.match(/\d+/g);
    const firstVal = Number(numericTokens[0]);
    const secondVal = Number(numericTokens[1]);

    const outcomeRules = [
      {
        check: (valA) => valA <= 5,
        calculate: (valA, valB) => 0
      },
      {
        check: (valA) => valA <= 12,
        calculate: (valA, valB) => valB / 2
      },
      {
        check: (valA) => true,
        calculate: (valA, valB) => valB
      }
    ];

    const applicableRule = outcomeRules.find(rule => rule.check(firstVal));
    const finalResult = applicableRule.calculate(firstVal, secondVal);

    console.log(finalResult);
  };

  processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
