const retrieveInt = nextInt;
const retrieveIntArray = nextIntArray;
const displayResult = myout;
const formatOutput = myconv;

function Main() {
  const dimVal = retrieveInt();
  const initialPositions = retrieveIntArray();
  const totalCells = dimVal * dimVal;

  const currentGridArrangement = initialPositions.reduce((acc, position, index) => {
    acc[position - 1] = index + 1;
    return acc;
  }, new Array(totalCells).fill(undefined));

  const fillFromLeft = (currentArr, d, val, numToPlace, cIdx) => {
    if (val > d) return currentArr;
    if (numToPlace === 0) {
      return fillFromLeft(currentArr, d, val + 1, val, 0);
    }
    if (cIdx >= totalCells) {
      return "No";
    }

    const cellContent = currentArr[cIdx];
    if (cellContent === undefined) {
      const nextArr = [...currentArr];
      nextArr[cIdx] = val;
      return fillFromLeft(nextArr, d, val, numToPlace - 1, cIdx + 1);
    } else if (cellContent === val) {
      return "No";
    } else {
      return fillFromLeft(currentArr, d, val, numToPlace, cIdx + 1);
    }
  };

  const afterLeftFill = fillFromLeft(currentGridArrangement, dimVal, 2, 1, 0);
  if (afterLeftFill === "No") {
    displayResult("No");
    return;
  }

  const fillFromRight = (currentArr, d, val, numToPlace, cIdx) => {
    if (val >= d) return currentArr;
    if (numToPlace === 0) {
      return fillFromRight(currentArr, d, val + 1, d - (val + 1), totalCells - 1);
    }
    if (cIdx < 0) {
      return "No";
    }

    const cellContent = currentArr[cIdx];
    if (cellContent === undefined) {
      const nextArr = [...currentArr];
      nextArr[cIdx] = val;
      return fillFromRight(nextArr, d, val, numToPlace - 1, cIdx - 1);
    } else if (cellContent === val) {
      return "No";
    } else {
      return fillFromRight(currentArr, d, val, numToPlace, cIdx - 1);
    }
  };

  const finalArrangement = fillFromRight(afterLeftFill, dimVal, 1, dimVal - 1, totalCells - 1);
  if (finalArrangement === "No") {
    displayResult("No");
    return;
  }

  const anyUnfilled = finalArrangement.some(cell => cell === undefined);
  if (anyUnfilled) {
    displayResult("No");
    return;
  }

  displayResult("Yes");
  displayResult(formatOutput(finalArrangement, 8));
}