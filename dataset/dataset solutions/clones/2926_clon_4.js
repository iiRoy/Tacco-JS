"use strict";

(function () {
  const processInputData = (sourceContent) => {
    const contentLines = sourceContent.split("\n");
    const initialLine = contentLines[0];

    // Divergent parsing strategy: using regex match instead of split and map
    const numericTokens = initialLine.match(/(\d+)\s+(\d+)/);

    // Assuming valid input format as per problem constraints
    const primaryValue = Number(numericTokens[1]);
    const secondaryValue = Number(numericTokens[2]);

    // Divergent control flow: using a dispatch array with predicates and actions
    const decisionPath = [
      {
        conditionCheck: (inputVal) => inputVal <= 5,
        calculation: (operandVal) => 0
      },
      {
        conditionCheck: (inputVal) => inputVal <= 16,
        calculation: (operandVal) => operandVal / 2
      },
      { // Default path for values > 16
        conditionCheck: (inputVal) => true,
        calculation: (operandVal) => operandVal
      }
    ];

    // Find the first matching rule and execute its associated calculation
    const finalResult = decisionPath.find(rule => rule.conditionCheck(primaryValue)).calculation(secondaryValue);

    console.log(finalResult);
  };

  processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
