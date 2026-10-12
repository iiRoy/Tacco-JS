function ProcessGameData(rawData) {
  let lines = rawData.split("\n");
  const lastLineIndex = lines.length - 1;
  if (lastLineIndex >= 0 && lines[lastLineIndex] === '') {
    lines.pop();
  }

  const firstLineParts = lines[0].split(' ');
  const gameLength = parseInt(firstLineParts[0], 10);
  const blockInterval = parseInt(firstLineParts[1], 10);

  const secondLineParts = lines[1].split(' ');
  const rockScore = parseInt(secondLineParts[0], 10);
  const scissorsScore = parseInt(secondLineParts[1], 10);
  const paperScore = parseInt(secondLineParts[2], 10);

  const movesSequence = lines[2];

  var totalScore = 0;
  var moveBlocked = Array(gameLength).fill(false);

  const scoreMap = {
    'r': paperScore,
    's': rockScore,
    'p': scissorsScore
  };

  const sequenceLength = movesSequence.length;

  for (var currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const previousIndex = currentIndex - blockInterval;
    const isBlockablePosition = currentIndex >= blockInterval;
    const isSameMoveAsPrevious = isBlockablePosition && movesSequence[currentIndex] === movesSequence[previousIndex];
    const wasPreviousMoveBlocked = isBlockablePosition && moveBlocked[previousIndex];

    if (isBlockablePosition && isSameMoveAsPrevious && !wasPreviousMoveBlocked) {
      moveBlocked[currentIndex] = true;
      continue;
    }

    totalScore += scoreMap[movesSequence[currentIndex]];
  }

  console.log(totalScore);
}

ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
