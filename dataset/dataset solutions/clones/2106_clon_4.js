function processInput(sourceData) {
  "use strict";
  const lineSegments = sourceData.split("\n");

  const initialSegment = lineSegments.shift();
  const operationCount = parseInt(lineSegments.shift());
  const operationList = lineSegments.map(entry => entry.split(" "));

  let frontBuffer = [];
  let backBuffer = [initialSegment];
  let isFlipped = false;

  for (const currentOperation of operationList) {
    const operationType = currentOperation.length;
    
    switch (operationType) {
      case 1:
        isFlipped = !isFlipped;
        break;
      case 3:
        const positionIndicator = currentOperation[1];
        const characterToAdd = currentOperation[2];

        if (!isFlipped) {
          if (positionIndicator === '1') {
            frontBuffer.unshift(characterToAdd);
          } else {
            backBuffer.push(characterToAdd);
          }
        } else {
          if (positionIndicator === '1') {
            backBuffer.push(characterToAdd);
          } else {
            frontBuffer.unshift(characterToAdd);
          }
        }
        break;
    }
  }

  let finalResult;
  if (!isFlipped) {
    finalResult = frontBuffer.reverse().join("") + backBuffer.join("");
  } else {
    finalResult = backBuffer.reverse().join("") + frontBuffer.join("");
  }

  console.log(finalResult);
}

function Main(input) {
    processInput(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
