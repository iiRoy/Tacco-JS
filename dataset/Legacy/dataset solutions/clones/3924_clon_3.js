function processInput(rawData) {
  const lines = rawData.split("\n");
  const firstLineContent = lines[0];
  const numQueries = +firstLineContent;

  for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
    const currentQueryLine = lines[queryIndex + 1];
    const stringNumberPairs = currentQueryLine.split(" ");
    const parsedNumberPairs = stringNumberPairs.map(strVal => +strVal);

    const firstInputVal = parsedNumberPairs[0];
    const secondInputVal = parsedNumberPairs[1];

    const largerValue = Math.max(firstInputVal, secondInputVal);
    const smallerValue = Math.min(firstInputVal, secondInputVal);

    const productOfValues = smallerValue * largerValue;
    const squareRootOfProduct = Math.sqrt(productOfValues);
    const ceilingOfSqrt = Math.ceil(squareRootOfProduct);
    const calculatedC = ceilingOfSqrt - 1;

    const initialTermForResult = smallerValue - 1;
    let finalResult = initialTermForResult * 2;

    const firstConditionCheck = smallerValue < largerValue - 1;
    if (firstConditionCheck) {
      finalResult = finalResult + 1;
    }

    const differenceCMinusA = calculatedC - smallerValue;
    const maxOfDiffAndZero = Math.max(differenceCMinusA, 0);
    finalResult += maxOfDiffAndZero * 2;

    const divisionProductTerm = (smallerValue / calculatedC) * largerValue;
    const floorOfDivisionProduct = Math.floor(divisionProductTerm);
    const secondConditionCheck = floorOfDivisionProduct === calculatedC;
    if (secondConditionCheck) {
      finalResult -= 1;
    }

    console.log(finalResult);
  }
}

(function() {
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin";
  const fileEncoding = "utf8";
  const fileContents = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
  processInput(fileContents);
})();
