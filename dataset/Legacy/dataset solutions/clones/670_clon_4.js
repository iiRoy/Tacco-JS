let inputBuffer = '';
let tokenProducer;

function displayResult(outcome) {
    console.log(outcome);
}

function* createTokenGenerator(rawInputContent) {
    const tokens = rawInputContent.trim().split(/\s+/);
    for (const token of tokens) {
        const numericValue = Number(token);
        yield isNaN(numericValue) ? token : numericValue;
    }
}

function processTaskSets(tokenSource) {
    let currentSetSize;
    while ((currentSetSize = tokenSource.next().value) !== undefined) {
        if (currentSetSize === 0) {
            displayResult("Yes");
            continue;
        }

        const jobRecords = Array.from({ length: currentSetSize }, () => {
            const jobDuration = tokenSource.next().value;
            const jobDeadline = tokenSource.next().value;
            return { duration: jobDuration, deadline: jobDeadline };
        });

        jobRecords.sort((firstEntry, secondEntry) => firstEntry.deadline - secondEntry.deadline);

        const scheduleEvaluation = jobRecords.reduce((accumulator, currentJob) => {
            if (!accumulator.isPossible) {
                return accumulator;
            }
            const updatedTime = accumulator.cumulativeTime + currentJob.duration;
            const currentPossibility = updatedTime <= currentJob.deadline;
            return {
                cumulativeTime: updatedTime,
                isPossible: currentPossibility
            };
        }, { cumulativeTime: 0, isPossible: true });

        displayResult(scheduleEvaluation.isPossible ? "Yes" : "No");
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    tokenProducer = createTokenGenerator(inputBuffer);
    processTaskSets(tokenProducer);
});
