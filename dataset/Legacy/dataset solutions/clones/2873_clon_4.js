debug = false
function log() {
  if (debug) {
    const arr = [];
    for (let i = 0; i < arguments.length; i++) {
      arr.push(arguments[i]);
    }
    console.log(arr.join(', '));
  }
}

const processSpecialSegment = (currentStatus, sequence, bCoord, cCoord, dCoord) => {
    if (cCoord <= dCoord) {
        return currentStatus;
    }

    const boundaryPoint = (cCoord - dCoord <= 3) ? cCoord : dCoord;
    
    let temporarySequence = sequence;

    if (sequence.charAt(dCoord - 2) === '#') {
        log(temporarySequence, temporarySequence.charAt(dCoord - 1));
        temporarySequence = sequence.slice(0, dCoord - 1) + '#' + sequence.slice(dCoord);
    }
    log(temporarySequence);

    const relevantSlice = temporarySequence.slice(bCoord - 1, boundaryPoint);
    log(relevantSlice, currentStatus);
    const segmentConditionMet = (relevantSlice.indexOf('...') !== -1);
    const updatedStatus = currentStatus && segmentConditionMet;
    log(relevantSlice, updatedStatus);
    return updatedStatus;
};

function Main(input) {
  const [parameterLine, sequenceLine] = input.split("\n");
  const [_, firstCoord, secondCoord, thirdCoord, fourthCoord] = parameterLine.split(" ").map(Number);
  const movementSequence = sequenceLine;

  log(_, firstCoord, secondCoord, thirdCoord, fourthCoord, movementSequence);

  let finalResult = true;

  finalResult = processSpecialSegment(finalResult, movementSequence, secondCoord, thirdCoord, fourthCoord);

  const rangeOne = movementSequence.slice(firstCoord - 1, thirdCoord);
  finalResult = finalResult && (rangeOne.indexOf('##') === -1);
  log(rangeOne, finalResult);

  const rangeTwo = movementSequence.slice(secondCoord - 1, fourthCoord);
  finalResult = finalResult && (rangeTwo.indexOf('##') === -1);
  log(rangeTwo, finalResult);

  console.log(finalResult ? 'Yes' : 'No');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
