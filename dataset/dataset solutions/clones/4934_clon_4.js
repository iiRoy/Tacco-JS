'use strict';

const obtainProcessedDetails = (sourceText) => {
    const [firstLineContent, challengeLineContent] = sourceText.trim().split('\n');
    const [_, eligibilityParamA, eligibilityParamB] = firstLineContent.split(' ').map(Number);
    const passingRequirement = eligibilityParamA + eligibilityParamB;
    return { passingRequirement, contestantSequence: challengeLineContent };
};

const assessContestantOutcomes = (parsedChallengeData) => {
    const { passingRequirement, contestantSequence } = parsedChallengeData;
    return [...contestantSequence].map((contestantType, currentCheckIndex) => {
        const currentRankValue = currentCheckIndex + 1;
        if (contestantType === 'a') {
            return currentRankValue < passingRequirement;
        } else if (contestantType === 'b') {
            const earlierChallenges = contestantSequence.substring(0, currentCheckIndex);
            const priorBParticipantCount = [...earlierChallenges].filter(s => s === 'b').length;
            return currentRankValue < priorBParticipantCount;
        } else {
            return false;
        }
    });
};

const composeFinalReport = (acceptanceFlags) => {
    return acceptanceFlags.map(isAccepted => (isAccepted ? 'Yes' : 'No') + '\n\n').join('');
};

const initiateProgramExecution = (programInput) => {
    const preparedChallengeDetails = obtainProcessedDetails(programInput);
    const finalAcceptanceDecisions = assessContestantOutcomes(preparedChallengeDetails);
    process.stdout.write(composeFinalReport(finalAcceptanceDecisions));
};

initiateProgramExecution(require("fs").readFileSync("/dev/stdin", "utf8"));