const processEnvData = () => {
  const mapExtent = 14;
  const influenceGrid = Array.from({ length: mapExtent }, () =>
    Array(mapExtent).fill(0)
  );

  const effectRegistry = {
    '1': [[0,0], [1,0], [-1,0], [0,1], [0,-1]],
    '2': [[0,0], [1,0], [-1,0], [0,1], [0,-1], [1,-1], [1,1], [-1,-1], [-1,1]],
    '3': [[0,0], [1,0], [-1,0], [0,1], [0,-1], [1,-1], [1,1], [-1,-1], [-1,1], [2,0], [-2,0], [0,-2], [0,2]]
  };

  const parsedInstructions = programInput
    .slice(0, -1)
    .map(instructionLine => {
      const numericTokens = instructionLine.match(/\d/g);
      return {
        xValue: parseInt(numericTokens[0], 10),
        yValue: parseInt(numericTokens[1], 10),
        effectCategory: numericTokens[2]
      };
    });

  parsedInstructions.forEach(instruction => {
    const { xValue, yValue, effectCategory } = instruction;
    const gridOffsetX = xValue + 2;
    const gridOffsetY = yValue + 2;

    (effectRegistry[effectCategory] || []).forEach(([deltaX, deltaY]) => {
      const targetX = gridOffsetX + deltaX;
      const targetY = gridOffsetY + deltaY;
      if (targetX >= 0 && targetX < mapExtent && targetY >= 0 && targetY < mapExtent) {
        influenceGrid[targetY][targetX]++;
      }
    });
  });

  const observationAreaSize = 10;
  let resultSummary = { untouchedSpots: 0, peakDensity: 0 };

  resultSummary = Array.from({ length: observationAreaSize }, (_, rowIterator) =>
    Array.from({ length: observationAreaSize }, (_, colIterator) => {
      const cellContent = influenceGrid[rowIterator + 2][colIterator + 2];
      return { isZeroVal: cellContent === 0, currentVal: cellContent };
    })
  ).flat().reduce((accumulator, cellInfo) => {
    accumulator.untouchedSpots += cellInfo.isZeroVal ? 1 : 0;
    accumulator.peakDensity = Math.max(accumulator.peakDensity, cellInfo.currentVal);
    return accumulator;
  }, resultSummary);

  console.log(resultSummary.untouchedSpots);
  console.log(resultSummary.peakDensity);
};

let programInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', dataSegment => {
  programInput += dataSegment;
});
process.stdin.on('end', () => {
  programInput = programInput.split('\n');
  processEnvData();
});