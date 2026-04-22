let rawDataBuffer = '';
let tokenCursor = 0;
let processedTokens = [];

function readNextToken(expectedType) {
    if (tokenCursor >= processedTokens.length) {
        return null;
    }
    const currentToken = processedTokens[tokenCursor];
    tokenCursor++;

    if (expectedType === 'string') {
        return currentToken;
    } else {
        // Attempt to convert to number. If not a valid number, Number() returns NaN.
        return Number(currentToken);
    }
}

function displayResult(outcomeMessage) {
    console.log(outcomeMessage);
}

function evaluateSchedulingScenarios() {
    let currentTaskCount; 
    
    while ((currentTaskCount = readNextToken()) !== null && currentTaskCount > 0) {
        const jobList = []; 

        for (let taskIndex = 0; taskIndex < currentTaskCount; taskIndex++) {
            const taskDuration = readNextToken();
            const taskDeadline = readNextToken();
            
            if (isNaN(taskDuration) || isNaN(taskDeadline)) {
                // If input is invalid, clear the list and break from this scenario's task reading.
                console.error(`Error: Invalid numeric input for task at index ${taskIndex}. Skipping current scenario.`);
                jobList.length = 0; 
                break; 
            }

            jobList.push({
                duration: taskDuration,
                deadline: taskDeadline
            });
        }

        if (jobList.length === 0 && currentTaskCount > 0) {
            // If tasks were expected but none were validly loaded, skip to next scenario.
            continue; 
        }

        jobList.sort((taskA, taskB) => {
            const deadlineDifference = taskA.deadline - taskB.deadline;
            if (deadlineDifference !== 0) {
                return deadlineDifference;
            }
            // Optional tie-breaking: If deadlines are identical, prioritize tasks with shorter durations.
            return taskA.duration - taskB.duration;
        });

        let cumulativeDuration = 0; 
        let isFeasible = true;       
        
        for (const currentJob of jobList) {
            cumulativeDuration += currentJob.duration;
            
            if (cumulativeDuration > currentJob.deadline) {
                isFeasible = false;
                break; 
            }
        }
        
        displayResult(isFeasible ? "Yes, all tasks can be completed." : "No, some tasks will miss deadlines.");
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    rawDataBuffer += dataChunk;
});

process.stdin.on('end', () => {
    // Process the accumulated raw input: trim whitespace, split by any whitespace,
    // and filter out any empty strings resulting from multiple spaces.
    processedTokens = rawDataBuffer.trim().split(/\s+/).filter(token => token.length > 0);
    
    evaluateSchedulingScenarios();
});