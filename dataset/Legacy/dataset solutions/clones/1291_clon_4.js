let rawData = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (segment) => {
  rawData += segment;
});

const evaluateScores = (primaryScore, secondaryScore, makeupScore) => {
  const aggregateScore = primaryScore + secondaryScore;

  switch (true) {
    case aggregateScore >= 80:
      return "A";
    case aggregateScore >= 65:
      return "B";
    case aggregateScore >= 50:
      return "C";
    case aggregateScore >= 30:
      return makeupScore >= 50 ? "C" : "D";
    default:
      return "F";
  }
};

process.stdin.on('end', () => {
  const allLines = rawData.split("\n");
  let currentLineIndex = 0;

  while (allLines[currentLineIndex] != 0) {
    const currentLineContent = allLines[currentLineIndex];

    const scoreStrings = currentLineContent.split(" ");

    if (scoreStrings[0] === "-1" && scoreStrings[1] === "-1" && scoreStrings[2] === "-1") {
      break;
    }

    let firstExam = parseInt(scoreStrings[0], 10);
    let secondExam = parseInt(scoreStrings[1], 10);
    let thirdExam = parseInt(scoreStrings[2], 10);

    if (firstExam === -1) {
      firstExam = 0;
    }
    if (secondExam === -1) {
      secondExam = 0;
    }

    const finalGrade = evaluateScores(firstExam, secondExam, thirdExam);
    console.log(finalGrade);

    currentLineIndex++;
  }
});
