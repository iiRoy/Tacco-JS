(async () => {
  const ioManager = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let parsedData = [];

  for await (const dataStream of ioManager) {
    parsedData = dataStream.trim().split(/\s+/).map(Number);
    ioManager.close();
    break;
  }

  const [firstParameter, secondParameter] = parsedData;

  const outcomeRules = [
    { ruleCheck: (valX) => valX <= 5, resultFunction: (valX, valY) => 0 },
    { ruleCheck: (valX) => valX <= 16, resultFunction: (valX, valY) => valY / 2 },
    { ruleCheck: (valX) => true, resultFunction: (valX, valY) => valY }
  ];

  let finalResult;
  for (const ruleEntry of outcomeRules) {
    if (ruleEntry.ruleCheck(firstParameter)) {
      finalResult = ruleEntry.resultFunction(firstParameter, secondParameter);
      break;
    }
  }

  console.log(finalResult);
})();