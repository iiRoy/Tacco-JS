const evaluateContestants = (contestInput) => {
  const [initialParameters, ...questionResponses] = contestInput;
  const [totalParticipants, startingPoints, totalQuestions] = initialParameters.split(" ").map(Number);

  const participantSuccessCounts = questionResponses.reduce((accumulator, respondentIdString) => {
    const respondentId = Number(respondentIdString);
    return accumulator.set(respondentId, (accumulator.get(respondentId) || 0) + 1);
  }, new Map());

  const outcomeMessages = Array.from({ length: totalParticipants }, (_, index) => index + 1)
    .map(currentParticipantId => {
      const correctAnswersByParticipant = participantSuccessCounts.get(currentParticipantId) || 0;
      const questionsNotAnsweredCorrectly = totalQuestions - correctAnswersByParticipant;
      const finalScoreForParticipant = startingPoints - questionsNotAnsweredCorrectly;
      return finalScoreForParticipant > 0 ? "Yes" : "No";
    });

  return outcomeMessages.join("\n");
};

const initiateCompetitionAnalysis = () => {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8').trim();
  const inputDataLines = rawInputContent.split("\n");
  const finalReport = evaluateContestants(inputDataLines);
  process.stdout.write(finalReport);
};

initiateCompetitionAnalysis();