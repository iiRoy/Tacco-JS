"use strict";

const evaluateScenario = (sourceText) => {
  const numericSegments = sourceText.trim().split(" ");
  const principalValue = Number(numericSegments[0]);
  const startOffset = Number(numericSegments[1]);
  const endOffset = Number(numericSegments[2]);

  const calculatedDiscrepancy = endOffset - startOffset;

  const outcomeResolvers = [
    { conditionCheck: (disc, princ) => disc < 0, outcomeIdentifier: "delicious" },
    { conditionCheck: (disc, princ) => disc < princ, outcomeIdentifier: "safe" },
    { conditionCheck: (disc, princ) => true, outcomeIdentifier: "dangerous" }
  ];

  const applicableResolver = outcomeResolvers.find(resolver =>
    resolver.conditionCheck(calculatedDiscrepancy, principalValue)
  );

  return applicableResolver.outcomeIdentifier;
};

console.log(evaluateScenario(require("fs").readFileSync("/dev/stdin", "utf8")));