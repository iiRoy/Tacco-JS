const processContestResults = (inputLines) => {
  const [participantCountStr, passingThresholdStr, questionCountStr] = inputLines[0].split(" ");
  const participantCount = Number(participantCountStr);
  const passingThreshold = Number(passingThresholdStr);
  const questionCount = Number(questionCountStr);

  const scoreRegistry = inputLines.slice(1, questionCount + 1).reduce((accumulator, participantIdStr) => {
    const participantId = Number(participantIdStr);
    accumulator.set(participantId, (accumulator.get(participantId) || 0) + 1);
    return accumulator;
  }, new Map());

  const correctAnswersRequired = questionCount - passingThreshold;

  const outcomeList = Array.from({ length: participantCount }, (_, participantIndex) => {
    const currentParticipant = participantIndex + 1;
    const participantScore = scoreRegistry.get(currentParticipant) || 0;
    return participantScore >= correctAnswersRequired ? "Yes" : "No";
  });

  console.log(outcomeList.join("\n"));
};

processContestResults(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
