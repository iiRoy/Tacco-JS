'use strict';

function acquireInputLines(lineQuantity) {
  return new Promise((resolve, reject) => {
    const streamReader = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    const collectedLines = [];
    let lineCounter = 0;

    streamReader.on('line', (currentLine) => {
      collectedLines.push(currentLine);
      lineCounter++;
      if (lineCounter === lineQuantity) {
        streamReader.close();
        resolve(collectedLines);
      }
    });

    streamReader.on('close', () => {
      if (lineCounter < lineQuantity) {
         reject(new Error(`Input stream ended prematurely. Expected ${lineQuantity} lines, got ${lineCounter}.`));
      }
    });

    streamReader.on('error', (err) => {
      reject(err);
    });
  });
}

async function executeComputation() {
  try {
    const receivedData = await acquireInputLines(4);

    const sourceElements = new Set(receivedData[1].split(' ').map(Number));

    const queryElements = receivedData[3].split(' ').map(Number);

    let foundCount = 0;
    for (const valToFind of queryElements) {
      if (sourceElements.has(valToFind)) {
        foundCount++;
      }
    }

    console.log(foundCount);
    process.exit(0);

  } catch (errorDetails) {
    console.error('An error occurred during processing:', errorDetails.message);
    process.exit(1);
  }
}

executeComputation();