function processGrid(rawInput) {
  const lines = rawInput.trim().split("\n");
  const gridDim = Number(lines[0]);
  const seatingOrder = lines[1].split(" ").map(Number);

  const positionLookup = new Map();
  for (let rowIdx = 1; rowIdx <= gridDim; rowIdx++) {
    for (let colIdx = 1; colIdx <= gridDim; colIdx++) {
      const seatNumber = (rowIdx - 1) * gridDim + colIdx;
      positionLookup.set(seatNumber, [rowIdx, colIdx]);
    }
  }

  const occupiedPositions = new Set();
  let unfavorableCount = 0;

  const generateSequence = (startValue, endValue, stepIncrement = 1) => {
    const sequence = [];
    if (stepIncrement > 0) {
      for (let k = startValue; k <= endValue; k += stepIncrement) sequence.push(k);
    } else {
      for (let k = startValue; k >= endValue; k += stepIncrement) sequence.push(k);
    }
    return sequence;
  };

  seatingOrder.forEach(personIdentifier => {
    const [originalRow, originalCol] = positionLookup.get(personIdentifier);

    occupiedPositions.add(`${originalRow},${originalCol}`);

    if (originalRow === 1 || originalCol === 1 || originalRow === gridDim || originalCol === gridDim) {
      return;
    }

    const visibleLeft = generateSequence(originalRow - 1, 1, -1)
      .filter(r => !occupiedPositions.has(`${r},${originalCol}`))
      .length;

    const visibleRight = generateSequence(originalRow + 1, gridDim)
      .filter(r => !occupiedPositions.has(`${r},${originalCol}`))
      .length;

    const visibleUp = generateSequence(originalCol - 1, 1, -1)
      .filter(c => !occupiedPositions.has(`${originalRow},${c}`))
      .length;

    const visibleDown = generateSequence(originalCol + 1, gridDim)
      .filter(c => !occupiedPositions.has(`${originalRow},${c}`))
      .length;

    unfavorableCount += Math.min(visibleLeft, visibleRight, visibleUp, visibleDown);
  });

  console.log(unfavorableCount);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
