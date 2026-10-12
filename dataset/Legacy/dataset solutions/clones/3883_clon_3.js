function Main(rawInput) {
  const inputLines = rawInput.split("\n");
  const firstLineParts = inputLines[0].split(" ");
  const numItems = parseInt(firstLineParts[0], 10);
  const totalCircumference = parseInt(firstLineParts[1], 10);

  const itemPositions = new Array(numItems);
  const itemValues = new Array(numItems);
  let lastIndexBeforeMidpoint = 0;

  for (let i = 0; i < numItems; i++) {
    const currentLineParts = inputLines[i + 1].split(" ");
    itemPositions[i] = parseInt(currentLineParts[0], 10);
    if (itemPositions[i] < totalCircumference / 2) {
      lastIndexBeforeMidpoint = i;
    }
    itemValues[i] = parseInt(currentLineParts[1], 10);
  }

  let maxCalorieGain = 0;

  const calculateForwardStepGain = (currentIndex, previousIndex, positions, values) => {
    if (previousIndex === null) {
      return values[currentIndex] - positions[currentIndex];
    } else {
      const distanceMoved = positions[currentIndex] - positions[previousIndex];
      return values[currentIndex] - distanceMoved;
    }
  };

  const calculateReverseStepGain = (currentIndex, nextIndex, positions, values, circumference) => {
    if (nextIndex === null) {
      return values[currentIndex] - (circumference - positions[currentIndex]);
    } else {
      const distanceMoved = positions[nextIndex] - positions[currentIndex];
      return values[currentIndex] - distanceMoved;
    }
  };

  let currentGain = 0;
  for (let i = 0; i < numItems; i++) {
    const prevPosIndex = (i === 0) ? null : i - 1;
    currentGain += calculateForwardStepGain(i, prevPosIndex, itemPositions, itemValues);
    maxCalorieGain = Math.max(maxCalorieGain, currentGain);
  }

  for (let i = lastIndexBeforeMidpoint; i >= 0; i--) {
    currentGain = 0;
    for (let j = 0; j <= i; j++) {
      const prevIdx = (j === 0) ? null : j - 1;
      currentGain += calculateForwardStepGain(j, prevIdx, itemPositions, itemValues);
      maxCalorieGain = Math.max(maxCalorieGain, currentGain);
    }
    currentGain -= itemPositions[i];

    for (let j = numItems - 1; j > i; j--) {
      const nextIdx = (j === numItems - 1) ? null : j + 1;
      currentGain += calculateReverseStepGain(j, nextIdx, itemPositions, itemValues, totalCircumference);
      maxCalorieGain = Math.max(maxCalorieGain, currentGain);
    }
  }

  for (let i = lastIndexBeforeMidpoint + 1; i < numItems; i++) {
    currentGain = 0;
    for (let j = numItems - 1; j >= i; j--) {
      const nextIdx = (j === numItems - 1) ? null : j + 1;
      currentGain += calculateReverseStepGain(j, nextIdx, itemPositions, itemValues, totalCircumference);
      maxCalorieGain = Math.max(maxCalorieGain, currentGain);
    }
    currentGain -= (totalCircumference - itemPositions[i]);

    for (let j = 0; j < i; j++) {
      const prevIdx = (j === 0) ? null : j - 1;
      currentGain += calculateForwardStepGain(j, prevIdx, itemPositions, itemValues);
      maxCalorieGain = Math.max(maxCalorieGain, currentGain);
    }
  }

  console.log('%s', maxCalorieGain);
}

function debug() {
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
