'use strict';
function processSource(dataOrigin) {
  const numericalComponents = dataOrigin.match(/\d+/g).map(Number);

  const sortedComponents = [...numericalComponents].sort((alpha, beta) => alpha - beta);

  const numericalValue = sortedComponents[0];

  const repetitionQuantity = sortedComponents[0];

  const unitString = String(numericalValue);

  const finalSequence = unitString.repeat(repetitionQuantity + 1);

  console.log(finalSequence);
}

processSource(require("fs").readFileSync("/dev/stdin", "utf8"));