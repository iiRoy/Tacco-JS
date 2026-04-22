function processData(rawData) {
  const allSegments = rawData.split('\n');
  const numericValue = Number.parseInt(allSegments[0], 10);
  const boundaryMark = numericValue / 2;
  const charString = allSegments[1];

  const initialStatus = {
    redTally: 0,
    blueTally: 0,
    isConcluded: false,
    finalJudgment: false
  };

  const finalStatus = Array.from(charString).reduce((currentStatus, currentSymbol) => {
    if (currentStatus.isConcluded) {
      return currentStatus;
    }

    let nextRedTally = currentStatus.redTally;
    let nextBlueTally = currentStatus.blueTally;
    let nextIsConcluded = currentStatus.isConcluded;
    let nextFinalJudgment = currentStatus.finalJudgment;

    if (currentSymbol === 'R') {
      nextRedTally++;
      if (nextRedTally > boundaryMark) {
        nextIsConcluded = true;
        nextFinalJudgment = true;
      }
    } else {
      nextBlueTally++;
      if (nextBlueTally >= boundaryMark) {
        nextIsConcluded = true;
        nextFinalJudgment = false;
      }
    }

    return {
      redTally: nextRedTally,
      blueTally: nextBlueTally,
      isConcluded: nextIsConcluded,
      finalJudgment: nextFinalJudgment
    };
  }, initialStatus);

  const resultPhrase = finalStatus.finalJudgment ? 'Yes' : 'No';
  console.log(resultPhrase);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));