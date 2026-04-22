const calculateDisplacements = (stoneArrangement) => {
  let presentBlueCount = 0;
  const finalMovementTally = Array.from(stoneArrangement).reduce((cumulativeSwaps, individualStone) => {
    if (individualStone === 'B') {
      presentBlueCount++;
    } else { // individualStone === 'W'
      cumulativeSwaps += presentBlueCount;
    }
    return cumulativeSwaps;
  }, 0);

  console.log(finalMovementTally);
};

calculateDisplacements(require("fs").readFileSync("/dev/stdin", "utf8"));