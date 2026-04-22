function determineZeroReachability(elementArray, directiveSequence) {
  const MAX_BIT_COUNT = 30;

  const linearBasis = new Array(MAX_BIT_COUNT).fill(0);

  let currentTargetXOR = 0;

  const reduceValueByBasis = (valToReduce, basis) => {
    for (let bitPosition = MAX_BIT_COUNT - 1; bitPosition >= 0; --bitPosition) {
      valToReduce = Math.min(valToReduce, valToReduce ^ basis[bitPosition]);
    }
    return valToReduce;
  };

  const insertValueIntoBasis = (valToInsert, basis) => {
    if (valToInsert === 0) return;

    for (let bitPosition = MAX_BIT_COUNT - 1; bitPosition >= 0; --bitPosition) {
      if (!((valToInsert >> bitPosition) & 1)) continue;
      if (basis[bitPosition] === 0) {
        basis[bitPosition] = valToInsert;
        return;
      }
      valToInsert ^= basis[bitPosition];
    }
  };

  for (let currentElementIndex = directiveSequence.length - 1; currentElementIndex >= 0; --currentElementIndex) {
    let numericComponent = Number(elementArray[currentElementIndex]);
    const instructionType = directiveSequence[currentElementIndex];

    const independentComponent = reduceValueByBasis(numericComponent, linearBasis);

    if (instructionType === '1') {
      if (independentComponent !== 0) {
        return false;
      }
    } else {
      currentTargetXOR ^= independentComponent;
      insertValueIntoBasis(independentComponent, linearBasis);
    }
  }

  return reduceValueByBasis(currentTargetXOR, linearBasis) === 0;
}

function orchestrateExecution(rawData) {
  const parsedLines = rawData.split('\n');
  const testCaseCount = Number(parsedLines[0]);
  const outcomeRepresentations = [];

  let currentLineOffset = 1;
  for (let caseIterator = 0; caseIterator < testCaseCount; ++caseIterator) {
    const elementValues = parsedLines[currentLineOffset + 1].split(' ');
    const directiveInstruction = parsedLines[currentLineOffset + 2];

    const possibilityFlag = determineZeroReachability(elementValues, directiveInstruction);
    outcomeRepresentations.push(possibilityFlag ? '0' : '1');

    currentLineOffset += 3;
  }

  const systemOutput = console;
  systemOutput.log(outcomeRepresentations.join('\n'));
}

const fileSystemUtility = require("fs");
const systemInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

orchestrateExecution(systemInputContent);