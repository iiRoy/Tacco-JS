class LadderPuzzleSolver {
    #totalColumnsCount;
    #startingColumnIndex;
    #endingColumnIndex;
    #maximumTraversalDepth;
    #horizontalBarrierLocations; // A Set<string> where each string is "row_col" for the left end of a bar

    constructor() {
        this.#totalColumnsCount = 0;
        this.#startingColumnIndex = 0;
        this.#endingColumnIndex = 0;
        this.#maximumTraversalDepth = 0;
        this.#horizontalBarrierLocations = new Set();
    }

    // Parses raw input lines to configure the puzzle
    ingestConfiguration(sourceLines) {
        const configurationKeys = ["totalColumnsCount", "startingColumnIndex", "endingColumnIndex", "maximumTraversalDepth"];
        let currentKeyIndex = 0;

        for (let currentLineContent of sourceLines) {
            if (currentLineContent === "0") break; // Terminator for bar data

            if (currentKeyIndex < configurationKeys.length) {
                const numericValue = parseInt(currentLineContent, 10);
                // Assign values to private fields based on their order
                switch (configurationKeys[currentKeyIndex]) {
                    case "totalColumnsCount": this.#totalColumnsCount = numericValue; break;
                    case "startingColumnIndex": this.#startingColumnIndex = numericValue - 1; break; // Convert to 0-indexed
                    case "endingColumnIndex": this.#endingColumnIndex = numericValue - 1; break;     // Convert to 0-indexed
                    case "maximumTraversalDepth": this.#maximumTraversalDepth = numericValue; break;
                }
                currentKeyIndex++;
            } else {
                // Parse horizontal bar definitions after configuration is read
                const currentRowIndex = sourceLines.indexOf(currentLineContent) - configurationKeys.length;
                for (let columnPosition = 0; columnPosition < currentLineContent.length; columnPosition++) {
                    if (currentLineContent.charAt(columnPosition) === '1') {
                        // Store the left-most column of the bar at this row
                        this.#horizontalBarrierLocations.add(`${currentRowIndex}_${columnPosition}`);
                    }
                }
            }
        }
    }

    // Recursively determines the path taken from a given starting point
    #determineJourney(currentLevel, currentColumnPosition, pathHistory) {
        if (currentLevel >= this.#maximumTraversalDepth) {
            return [...pathHistory, currentColumnPosition]; // Add the final reached position
        }

        let nextColumnPosition = currentColumnPosition;
        // Check if there's a barrier to the right of the current column
        if (this.#horizontalBarrierLocations.has(`${currentLevel}_${currentColumnPosition}`)) {
            nextColumnPosition = currentColumnPosition + 1;
        }
        // Check if there's a barrier to the left of the current column
        else if (currentColumnPosition > 0 && this.#horizontalBarrierLocations.has(`${currentLevel}_${currentColumnPosition - 1}`)) {
            nextColumnPosition = currentColumnPosition - 1;
        }
        // If no barrier, nextColumnPosition remains currentColumnPosition (goes straight down)

        return this.#determineJourney(currentLevel + 1, nextColumnPosition, [...pathHistory, currentColumnPosition]);
    }

    // Retrieves the path starting from the configured initial column
    fetchInitialRoute() {
        return this.#determineJourney(0, this.#startingColumnIndex, []);
    }

    // Finds the path that eventually leads to the configured destination column
    // This involves testing all possible starting columns from the top
    fetchDestinationRoute() {
        for (let testStartingColumn = 0; testStartingColumn < this.#totalColumnsCount; testStartingColumn++) {
            const potentialRoute = this.#determineJourney(0, testStartingColumn, []);
            if (potentialRoute[potentialRoute.length - 1] === this.#endingColumnIndex) {
                return potentialRoute;
            }
        }
        // This case implies an unresolvable puzzle or a logic error given problem constraints
        return null; 
    }

    // Provides access to the puzzle's configuration details
    get currentConfiguration() {
        return {
            totalColumns: this.#totalColumnsCount,
            initialColumn: this.#startingColumnIndex,
            finalColumn: this.#endingColumnIndex,
            maxDepth: this.#maximumTraversalDepth,
            barriers: this.#horizontalBarrierLocations
        };
    }
}

// Global collection for raw input lines received from stdin
let collectedInputLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (inputSegment) => {
    inputSegment.trim().split('\n').forEach(lineText => {
        collectedInputLines.push(lineText);
    });
});

process.stdin.on('end', () => {
    const puzzle = new LadderPuzzleSolver();
    puzzle.ingestConfiguration(collectedInputLines);

    const currentPuzzleSettings = puzzle.currentConfiguration;
    const initialColumnPath = puzzle.fetchInitialRoute();

    // Check if the initial path already reaches the destination
    if (initialColumnPath[initialColumnPath.length - 1] === currentPuzzleSettings.finalColumn) {
        console.log("0");
        return;
    }

    const destinationColumnPath = puzzle.fetchDestinationRoute();
    let finalOutcomeIndicator = "1"; // Default result if no solution found

    // Iterate through each step to find a suitable bar placement
    for (let currentStep = 0; currentStep < currentPuzzleSettings.maxDepth; currentStep++) {
        const initialPathPosition = initialColumnPath[currentStep];
        const destinationPathPosition = destinationColumnPath[currentStep];

        // Check if the two paths are adjacent at the current step
        if (Math.abs(initialPathPosition - destinationPathPosition) === 1) {
            const leftBarrierColumn = Math.min(initialPathPosition, destinationPathPosition);
            // Check if there is no existing barrier between these adjacent columns at this step
            if (!currentPuzzleSettings.barriers.has(`${currentStep}_${leftBarrierColumn}`)) {
                // Found a spot to place a new barrier
                finalOutcomeIndicator = `${currentStep + 1} ${leftBarrierColumn + 1}`; // Output 1-indexed
                break;
            }
        }
    }

    console.log(finalOutcomeIndicator);
});