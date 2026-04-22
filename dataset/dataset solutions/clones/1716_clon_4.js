class InputLineSource {
    constructor(sourceLines) {
        this.dataLines = sourceLines;
        this.currentPosition = 0;
    }

    hasMoreContent() {
        return this.currentPosition < this.dataLines.length;
    }

    retrieveNextValue() {
        if (!this.hasMoreContent()) {
            throw new Error("Input stream exhausted. No further data available.");
        }
        return this.dataLines[this.currentPosition++];
    }
}

let globalDataStream;
let inputBufferContainer = [];

const getNextItem = () => globalDataStream.retrieveNextValue();
const hasPendingItems = () => globalDataStream.hasMoreContent();

const getNextInteger = () => parseInt(getNextItem(), 10);
const getNextIntegerSequence = () => getNextItem().split(" ").map(Number);

const displayOutput = (contentList, joinString = "\n") => {
    console.log(contentList.join(joinString));
};

const displayDebugInfo = (debugObject) => {
    console.error(`diagnostics: ${JSON.stringify(debugObject)}`);
};

const executeCompetitionSimulation = () => {
    const totalEventPeriods = getNextInteger();
    const penaltyFactors = getNextIntegerSequence();

    const recentEventOccurrences = new Map(Array.from({ length: 26 }, (_, index) => [index, 0]));

    const cumulativeScores = [];

    const processDailyCycle = (currentCycleNumber, previousCumulativeTotal) => {
        if (currentCycleNumber > totalEventPeriods) {
            return;
        }

        const currentDaySatisfactionValues = getNextIntegerSequence();

        const { maximumSatisfactionValue, selectedEventIdentifier } = currentDaySatisfactionValues.reduce(
            (accumulator, satisfactionRating, eventTypeIdentifier) => {
                if (satisfactionRating > accumulator.maximumSatisfactionValue) {
                    return {
                        maximumSatisfactionValue: satisfactionRating,
                        selectedEventIdentifier: eventTypeIdentifier,
                    };
                }
                return accumulator;
            },
            { maximumSatisfactionValue: -Infinity, selectedEventIdentifier: -1 }
        );

        recentEventOccurrences.set(selectedEventIdentifier, currentCycleNumber);

        const totalPenaltyAdjustment = penaltyFactors.reduce((totalAdjustment, factorCoefficient, eventIdentifier) => {
            const lastHeldDate = recentEventOccurrences.get(eventIdentifier) || 0;
            return totalAdjustment + factorCoefficient * (currentCycleNumber - lastHeldDate);
        }, 0);

        const currentPeriodAdjustedScore = maximumSatisfactionValue - totalPenaltyAdjustment;

        const newCumulativeTotal = previousCumulativeTotal + currentPeriodAdjustedScore;
        cumulativeScores.push(newCumulativeTotal);

        displayDebugInfo(currentPeriodAdjustedScore);

        processDailyCycle(currentCycleNumber + 1, newCumulativeTotal);
    };

    processDailyCycle(1, 0);

    displayOutput(cumulativeScores);
};

const setupAndRun = (inputLinesFromSource) => {
    inputBufferContainer = inputLinesFromSource;
    globalDataStream = new InputLineSource(inputBufferContainer);

    const executionStartTime = new Date();
    executeCompetitionSimulation();
    const executionEndTime = new Date() - executionStartTime;

    displayDebugInfo(`time elapsed: ${executionEndTime}ms`);
    displayDebugInfo(`memory footprint: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
};

// This final part simulates the original's readline event handling.
// In a real environment, `process.stdin` would be read into `inputBufferContainer`.
// For a self-contained clone, we assume `setupAndRun` will be called with an array of input strings.
// Example:
// const sampleInput = [
//     "2",
//     "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1",
//     "100 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0",
//     "0 100 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
// ];
// setupAndRun(sampleInput);