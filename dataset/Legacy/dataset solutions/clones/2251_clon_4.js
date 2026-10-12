function Main(input) {
  const lines = input.trim().split('\n');
  const [problemCount, submissionCount] = lines[0].split(' ').map(Number);
  const submissions = lines.slice(1).map(line => line.split(' '));

  const initialProcessingState = {
    successfulProblemCount: 0,
    accumulatedPenalty: 0,
    problemAttemptRecords: new Map(),
    lastSuccessfullyAcceptedProblem: null
  };

  const finalProcessingState = submissions.reduce((currentAccumulator, currentSubmissionEntry) => {
    const [currentProblemIdentifier, submissionOutcome] = currentSubmissionEntry;

    if (!currentAccumulator.problemAttemptRecords.has(currentProblemIdentifier)) {
      currentAccumulator.problemAttemptRecords.set(currentProblemIdentifier, 0);
    }

    switch (submissionOutcome) {
      case 'AC':
        if (currentAccumulator.lastSuccessfullyAcceptedProblem !== currentProblemIdentifier) {
          currentAccumulator.successfulProblemCount++;
          currentAccumulator.accumulatedPenalty += currentAccumulator.problemAttemptRecords.get(currentProblemIdentifier);
          currentAccumulator.lastSuccessfullyAcceptedProblem = currentProblemIdentifier;
        }
        break;
      case 'WA':
        currentAccumulator.problemAttemptRecords.set(
          currentProblemIdentifier,
          currentAccumulator.problemAttemptRecords.get(currentProblemIdentifier) + 1
        );
        break;
    }
    return currentAccumulator;
  }, initialProcessingState);

  console.log(`${finalProcessingState.successfulProblemCount} ${finalProcessingState.accumulatedPenalty}`);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
