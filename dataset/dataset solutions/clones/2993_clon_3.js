// Function to simulate agent movement within a grid under dynamic boundary conditions.
function SimulateMovement(entryData) {
    // Helper function for parsing numeric values from a string line.
    const parseNumericLine = (line) => line.split(" ").map(Number);

    // Initial processing of raw input data.
    const processedLines = entryData.split("\n");

    // Extracting grid dimensions and total operations.
    const [gridHeight, gridWidth, totalOperations] = parseNumericLine(processedLines[0]);

    // Extracting starting coordinates for the agent.
    const [initialRowPosition, initialColumnPosition] = parseNumericLine(processedLines[1]);

    // Parsing the sequence of agent's intended movements.
    const agentMovementSequence = processedLines[2].split("");

    // Parsing the sequence of environmental boundary adjustments.
    const environmentAdjustments = processedLines[3].split("");

    // Early exit for trivial cases or invalid inputs.
    if (totalOperations === 0 || gridHeight <= 0 || gridWidth <= 0) {
        console.log("YES");
        return "YES";
    }

    // Initialize counters for agent's displacement in each direction.
    let displacementLeft = 0;
    let displacementRight = 0;
    let displacementUp = 0;
    let displacementDown = 0;

    // Initialize counters for how much the 'walls' or boundaries have effectively expanded.
    let wallShiftLeft = 0;
    let wallShiftRight = 0;
    let wallShiftUp = 0;
    let wallShiftDown = 0;

    // The final outcome message, initialized to "YES" (valid path).
    let pathOutcome = "YES";

    // Iterate through each step of the simulation, up to the total number of operations.
    for (let currentStepIndex = 0; currentStepIndex < totalOperations; currentStepIndex++) {
        const currentAgentMove = agentMovementSequence[currentStepIndex];
        const currentEnvironmentAdjustment = environmentAdjustments[currentStepIndex];

        // Update agent's displacement based on its current move.
        switch (currentAgentMove) {
            case "L":
                displacementLeft++;
                break;
            case "R":
                displacementRight++;
                break;
            case "U":
                displacementUp++;
                break;
            case "D":
                displacementDown++;
                break;
        }

        // Check if the agent has crossed any boundaries based on its current displacement.
        // Note: Coordinates are 1-indexed.
        const currentMinCol = initialColumnPosition - displacementLeft;
        const currentMaxCol = initialColumnPosition + displacementRight;
        const currentMinRow = initialRowPosition - displacementUp;
        const currentMaxRow = initialRowPosition + displacementDown;

        // If the agent's effective path extends beyond the grid boundaries, the path is invalid.
        if (currentMaxCol > gridWidth) {
            pathOutcome = "NO";
            break;
        }
        if (currentMinCol <= 0) {
            pathOutcome = "NO";
            break;
        }
        if (currentMaxRow > gridHeight) {
            pathOutcome = "NO";
            break;
        }
        if (currentMinRow <= 0) {
            pathOutcome = "NO";
            break;
        }

        // Apply environmental adjustments to potentially expand the allowed movement range.
        // These adjustments effectively "undo" a character's move, giving it more room.
        switch (currentEnvironmentAdjustment) {
            case "R":
                // If the right wall shifts right, and the new boundary is within grid width.
                if (initialColumnPosition + wallShiftRight + 1 <= gridWidth) {
                    displacementLeft--;
                    wallShiftRight++;
                }
                break;
            case "L":
                // If the left wall shifts left, and the new boundary is within grid (i.e., > 0).
                if (initialColumnPosition - wallShiftLeft - 1 > 0) {
                    displacementRight--;
                    wallShiftLeft++;
                }
                break;
            case "U":
                // If the up wall shifts up, and the new boundary is within grid (i.e., > 0).
                if (initialRowPosition - wallShiftUp - 1 > 0) {
                    displacementDown--;
                    wallShiftUp++;
                }
                break;
            case "D":
                // If the down wall shifts down, and the new boundary reaches or exceeds grid height.
                if (initialRowPosition + wallShiftDown + 1 >= gridHeight) {
                    displacementUp--;
                    wallShiftDown++;
                }
                break;
        }
    }

    // Output the final decision.
    console.log('%s', pathOutcome);
    return pathOutcome;
}

// Helper function for validating test results in a browser context.
function validateTestResult(testNumber) {
    const testInputId = "input" + testNumber;
    const testOutputId = "output" + testNumber;
    const resultDisplayId = "result" + testNumber;

    const currentInput = document.getElementById(testInputId)?.value;
    const expectedOutput = document.getElementById(testOutputId)?.value.split("\n")[0];

    if (!currentInput || !expectedOutput) {
        console.error(`Missing input or output for test ${testNumber}`);
        document.getElementById(resultDisplayId).innerHTML = "ERROR";
        return;
    }

    const actualResult = SimulateMovement(currentInput);

    let testStatus = "WA";
    if (actualResult === expectedOutput) {
        testStatus = "AC";
    }

    document.getElementById(resultDisplayId).innerHTML = testStatus;
}

// Standard competitive programming input reading (Node.js environment).
try {
    const fileSystem = require("fs");
    const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    SimulateMovement(inputData);
} catch (e) {
    // This block is typically for browser environments or if fs module isn't available.
    // In a competitive programming context, this would usually not be hit.
}