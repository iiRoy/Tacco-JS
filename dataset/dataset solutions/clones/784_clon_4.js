const { createInterface } = require('readline');

function orchestrateCoinProcessing() {
  const inputLineBuffer = [];
  const inputInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  inputInterface.on('line', (currentLine) => {
    inputLineBuffer.push(currentLine);
  });

  inputInterface.on('close', () => {
    processAllSituations(inputLineBuffer);
  });
}

function processAllSituations(allRecordedLines) {
  let currentLinePointer = 0;
  const resultAccumulator = [];

  const denominationStructure = [
    { value: 10, position: 0 },
    { value: 50, position: 1 },
    { value: 100, position: 2 },
    { value: 500, position: 3 }
  ];

  const descendingDenominations = [...denominationStructure].sort((a, b) => b.value - a.value);

  while (allRecordedLines[currentLinePointer] !== '0') {
    const itemPrice = Number(allRecordedLines[currentLinePointer++]);
    const initialClientCoinCounts = allRecordedLines[currentLinePointer++].split(' ').map(Number);

    const initialTotalAssetValue = initialClientCoinCounts.reduce((total, count, index) =>
      total + (count * denominationStructure[index].value), 0
    );

    let desiredRetainedValue = initialTotalAssetValue - itemPrice;

    const actualRetainedCoinCounts = Array(4).fill(0);

    for (const unit of descendingDenominations) {
      const availableToClient = initialClientCoinCounts[unit.position];
      const numToKeep = Math.min(Math.floor(desiredRetainedValue / unit.value), availableToClient);
      
      actualRetainedCoinCounts[unit.position] = numToKeep;
      desiredRetainedValue -= (numToKeep * unit.value);
    }

    const coinsExpended = initialClientCoinCounts.map((initialCount, idx) =>
      initialCount - actualRetainedCoinCounts[idx]
    );

    const caseSpecificOutput = [];
    for (let idx = 0; idx < 4; idx++) {
      if (coinsExpended[idx] > 0) {
        caseSpecificOutput.push(`${denominationStructure[idx].value} ${coinsExpended[idx]}`);
      }
    }
    resultAccumulator.push(caseSpecificOutput.join('\n'));
    resultAccumulator.push('');
  }
  
  if (resultAccumulator.length > 0 && resultAccumulator[resultAccumulator.length - 1] === '') {
      resultAccumulator.pop();
  }

  process.stdout.write(resultAccumulator.join('\n'));
}

orchestrateCoinProcessing();