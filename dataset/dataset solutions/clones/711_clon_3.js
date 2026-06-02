const fsModule = require('fs');
const rawInputContent = fsModule.readFileSync('/dev/stdin', 'utf8');
const trimmedInput = rawInputContent.trim();
const processedLines = trimmedInput.split("\n");

const MIN_LINES_FOR_PROCESSING = 2;

while (processedLines.length >= MIN_LINES_FOR_PROCESSING) {
    const currentLineData = processedLines.shift();
    const cleanedLine = currentLineData.trim();
    const lineSegments = cleanedLine.split(" ");

    const totalUsers = Number(lineSegments[0]);
    const targetDuration = Number(lineSegments[1]);

    let activeUserIndex = 0;
    let currentCycleTimer = targetDuration;
    let userTimers = [];

    const INITIAL_USER_TIMER_VALUE = 0;

    while (userTimers[activeUserIndex] !== targetDuration) {
        if (currentCycleTimer > INITIAL_USER_TIMER_VALUE) {
            let userAccumulatedTime = userTimers[activeUserIndex] || INITIAL_USER_TIMER_VALUE;
            userTimers[activeUserIndex] = userAccumulatedTime + 1;
            currentCycleTimer = currentCycleTimer - 1;
        } else {
            currentCycleTimer = userTimers[activeUserIndex];
            userTimers[activeUserIndex] = INITIAL_USER_TIMER_VALUE;
        }
        let nextUserCandidate = activeUserIndex + 1;
        activeUserIndex = nextUserCandidate % totalUsers;
    }
    console.log(activeUserIndex);
}
