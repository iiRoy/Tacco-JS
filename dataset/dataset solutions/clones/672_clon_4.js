process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputAccumulator = '';
let processedTokens = [];
let tokenPointer = 0;

const inputProcessor = {
    retrieveNext: function() {
        if (tokenPointer >= processedTokens.length) {
            // Should not happen in this setup as all input is processed at 'end'
            return null;
        }
        return processedTokens[tokenPointer++];
    },
    fetchNumericValue: function() {
        return Number.parseInt(this.retrieveNext(), 10);
    }
};

const outputEmitter = {
    displayResult: function(content) {
        console.log(content);
    }
};

function orchestrateSchedulingChecks() {
    while (true) {
        const taskCount = inputProcessor.fetchNumericValue();
        if (taskCount === 0) {
            break;
        }

        const taskDefinitions = Array.from({ length: taskCount }, () => {
            const durationValue = inputProcessor.fetchNumericValue();
            const deadlineValue = inputProcessor.fetchNumericValue();
            return [durationValue, deadlineValue];
        });

        taskDefinitions.sort((firstTask, secondTask) => firstTask[1] - secondTask[1]);

        let accumulatedTime = 0;
        const allTasksFeasible = taskDefinitions.every(currentTask => {
            accumulatedTime += currentTask[0];
            return currentTask[1] >= accumulatedTime;
        });

        outputEmitter.displayResult(allTasksFeasible ? "Yes" : "No");
    }
}

process.stdin.on('data', function(chunk) {
    inputAccumulator += chunk;
});

process.stdin.on('end', function() {
    processedTokens = inputAccumulator.trim().split(/\s+/);
    orchestrateSchedulingChecks();
});
