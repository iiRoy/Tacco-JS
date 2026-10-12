'use strict';

async function sequenceExecutor(operationSequence) {
  let priorOperationResults = [];
  for (const currentOperation of operationSequence) {
    priorOperationResults = await new Promise((resolveOperation) => {
      const operationCompletion = (...args) => resolveOperation(args);
      currentOperation(...priorOperationResults, operationCompletion);
    });
  }
  return priorOperationResults;
}

async function inputLineCollector(requiredLineCount) {
  const linePromises = require('readline/promises');
  const lineInterface = linePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const collectedLines = [];
  let lineCounter = 0;

  try {
    for await (const currentLine of lineInterface) {
      collectedLines.push(currentLine);
      lineCounter++;
      if (lineCounter === requiredLineCount) {
        break;
      }
    }
  } finally {
    lineInterface.close();
  }
  return collectedLines;
}

(async () => {
  try {
    const finalResultArray = await sequenceExecutor([
      function(resolveOperation) {
        inputLineCollector(4)
          .then(collectedLines => resolveOperation(collectedLines))
          .catch(error => {
            resolveOperation(error);
          });
      },
      function(allInputLines, resolveOperation) {
        const parseNum = (numericString) => Number(numericString);
        const sourceNumbers = allInputLines[1].split(' ').map(parseNum);
        const targetNumbers = allInputLines[3].split(' ').map(parseNum);

        function iterativeSearch(dataCollection, searchTarget) {
          let startIndex = 0;
          let endIndex = dataCollection.length - 1;

          while (startIndex <= endIndex) {
            const middleIndex = startIndex + Math.floor((endIndex - startIndex) / 2);
            const middleElement = dataCollection[middleIndex];

            if (searchTarget === middleElement) {
              return 1;
            }
            if (searchTarget < middleElement) {
              endIndex = middleIndex - 1;
            } else {
              startIndex = middleIndex + 1;
            }
          }
          return 0;
        }

        let foundCount = 0;
        for (const currentTarget of targetNumbers) {
          foundCount += iterativeSearch(sourceNumbers, currentTarget);
        }

        resolveOperation(foundCount);
      }
    ]);

    console.log(finalResultArray[0]);
    process.exit(0);

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
  }
})();
