const programArgs = process.argv.slice(2);

const calculateTableTennisScore = (params) => {
  const [totalTables, playerATable, playerBTable] = params;

  const tableDistance = playerBTable - playerATable;
  const tablesBetween = tableDistance - 1;

  if (tableDistance === 2) {
    return 1;
  }

  if (tablesBetween % 2 !== 0) {
    return tableDistance / 2;
  }

  const distFromStartA = playerATable - 1;
  const distFromEndB = totalTables - playerBTable;

  let intermediateScoreComponent;
  if (tablesBetween >= 4) {
    intermediateScoreComponent = tablesBetween - 1;
  } else if (tablesBetween === 2) {
    intermediateScoreComponent = 2;
  } else {
    intermediateScoreComponent = null;
  }

  if (distFromStartA <= distFromEndB) {
    if (intermediateScoreComponent !== null) {
      return distFromStartA + intermediateScoreComponent;
    } else {
      return playerATable;
    }
  } else {
    if (intermediateScoreComponent !== null) {
      return distFromEndB + intermediateScoreComponent;
    } else {
      return totalTables - playerATable;
    }
  }
};

console.log(calculateTableTennisScore(programArgs));
