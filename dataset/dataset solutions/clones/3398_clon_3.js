const areElementsUniform = (arrParameter) => {
    if (!Array.isArray(arrParameter) || arrParameter.length === 0) {
        return true;
    }
    const firstElementValue = arrParameter[0];
    for (let currentMember of arrParameter) {
        if (currentMember !== firstElementValue) {
            return false;
        }
    }
    return true;
};

/**
 * Executes a state-based transformation and counting process on a numerical sequence.
 * @param {string} rawInputStringData - The raw string input, expected to be two lines.
 */
function processNumericalSequence(rawInputStringData) {
    const dataLines = rawInputStringData.trim().split('\n');

    if (dataLines.length < 2) {
        console.error("Execution Error: Input data is incomplete. Two lines are required.");
        return;
    }

    const seriesLength = parseInt(dataLines[0], 10);
    if (isNaN(seriesLength) || seriesLength <= 0) {
        console.error("Execution Error: Invalid series length specified in the first line.");
        return;
    }

    const numericValueStrings = dataLines[1].split(' ');
    const numberSeries = numericValueStrings.map(Number);

    if (numberSeries.length !== seriesLength) {
        console.error("Execution Error: Discrepancy between declared series length and actual number of elements.");
        return;
    }
    if (numberSeries.some(isNaN)) {
        console.error("Execution Error: Non-numeric content detected within the series data.");
        return;
    }

    let processingStateIndicator = 0; // Tracks the operational mode: 0 (stable), 1 (modifying), 2 (expanding).
    let operationCountAccumulator = 1; // Accumulates a count based on specific operations.

    const initialBufferSize = numberSeries[0];
    if (isNaN(initialBufferSize) || initialBufferSize <= 0) {
        console.error("Execution Error: The first element of the series is not a valid positive number for buffer initialization.");
        return;
    }
    let workingBufferArray = new Array(initialBufferSize).fill(1);

    for (let currentSeriesIndex = 1; currentSeriesIndex < seriesLength; ++currentSeriesIndex) {
        const previousSeriesValue = numberSeries[currentSeriesIndex - 1];
        const currentSeriesValue = numberSeries[currentSeriesIndex];

        if (currentSeriesValue < previousSeriesValue) {
            workingBufferArray.length = currentSeriesValue;
        }

        if (processingStateIndicator === 2) {
            if (!areElementsUniform(workingBufferArray)) {
                processingStateIndicator = 1;
            } else {
                processingStateIndicator = 0;
            }
        }

        if (currentSeriesValue > previousSeriesValue) {
            const sizeDifference = currentSeriesValue - previousSeriesValue;
            workingBufferArray.push(...Array(sizeDifference).fill(1));
            processingStateIndicator = 2;
        } else if (processingStateIndicator === 0) {
            const targetPosition = currentSeriesValue - 1;
            if (targetPosition >= 0 && targetPosition < workingBufferArray.length) {
                workingBufferArray[targetPosition]++;
            } else {
                console.warn(`Warning: Index ${targetPosition} is out of bounds for buffer length ${workingBufferArray.length}. Skipping increment.`);
            }
            workingBufferArray.length = currentSeriesValue;

            if (workingBufferArray.length !== 1) {
                processingStateIndicator = 1;
                operationCountAccumulator++;
            }
        } else if (processingStateIndicator === 1) {
            workingBufferArray.length = currentSeriesValue;

            let modeTransitionOccurred = false;
            for (let bufferPosition = currentSeriesValue - 1; bufferPosition >= 0; --bufferPosition) {
                if (workingBufferArray[bufferPosition] === operationCountAccumulator) {
                    workingBufferArray[bufferPosition] = 1;
                } else {
                    workingBufferArray[bufferPosition]++;
                    processingStateIndicator = 2;
                    modeTransitionOccurred = true;
                    break;
                }
            }
        }
    }

    const finalResultValue = operationCountAccumulator;
    process.stdout.write(`${finalResultValue}\n`);
}

// --- Environment-specific Execution Logic ---

// Helper for local testing or browser environments.
const executeTestSequence = (testData = "") => {
    console.log("--- Initiating Test Execution ---");
    if (testData) {
        processNumericalSequence(testData);
    } else {
        const defaultScenario = `5\n1 2 1 3 2`; // A predefined test case.
        console.log("No specific test data provided. Using default scenario:\n" + defaultScenario);
        processNumericalSequence(defaultScenario);
    }
    console.log("--- Test Execution Concluded ---");
};

// Determines the execution environment (Node.js vs. Browser) and handles input accordingly.
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node.js environment: Reads from standard input.
    try {
        const nodeInput = require("fs").readFileSync("/dev/stdin", "utf8");
        processNumericalSequence(nodeInput);
    } catch (ioError) {
        console.error("Input/Output Error in Node.js environment:", ioError.message);
        // Fallback to a default test if reading from stdin fails.
        executeTestSequence();
    }
} else if (typeof document !== 'undefined') {
    // Browser environment: Assumes HTML elements for input and triggering.
    document.addEventListener('DOMContentLoaded', () => {
        const inputTextArea = document.getElementById("input");
        const triggerButton = document.getElementById("runAnalysisButton"); // Expecting a button with this ID.

        if (inputTextArea && triggerButton) {
            triggerButton.addEventListener('click', () => {
                executeTestSequence(inputTextArea.value);
            });
        } else {
            console.warn("Browser elements (inputTextArea or triggerButton) not found. Running default test.");
            executeTestSequence();
        }
    });
} else {
    // Other environments or direct script execution.
    console.warn("Unrecognized execution context. Proceeding with a default test scenario.");
    executeTestSequence();
}