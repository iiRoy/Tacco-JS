const getRawInput = (sourcePath = '/dev/stdin') => {
    try {
        // Attempt to read file content from the specified path
        return require('fs').readFileSync(sourcePath, 'utf8');
    } catch (error) {
        // Log an error if file reading fails and return an empty string
        console.error(`Error: Could not read input from ${sourcePath}. Details: ${error.message}`);
        return '';
    }
};

// Permitted color codes, frozen to prevent modification
const COLOR_CODES = Object.freeze(['b', 'r', 'g']);

/**
 * Checks if a given character is one of the valid color codes.
 * @param {string} char The character to validate.
 * @returns {boolean} True if the character is a valid color, false otherwise.
 */
const isValidColor = (char) => COLOR_CODES.includes(char);

/**
 * Represents a sequence of colored segments, akin to a 'worm' state.
 * It tracks its pattern and the cost (number of transitions) to reach this state.
 */
class SegmentChain {
    /**
     * Initializes a new SegmentChain instance.
     * @param {string} pattern The string representation of the color sequence.
     * @param {number} [cost=0] The number of steps taken to reach this pattern.
     * @throws {Error} If the pattern is invalid (not a string, empty, or contains invalid colors).
     */
    constructor(pattern, cost = 0) {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            throw new Error("SegmentChain: Pattern must be a non-empty string.");
        }
        // Validate each character in the pattern using the helper function
        if (![...pattern].every(isValidColor)) {
            throw new Error(`SegmentChain: Invalid color character detected in pattern: "${pattern}"`);
        }

        this.patternString = pattern;
        this.transitionCost = cost;
    }

    /**
     * Generates all possible successor patterns by applying the transformation rule.
     * The rule: find adjacent identical colors, replace them with the third unique color.
     * @returns {string[]} An array of new pattern strings that can be reached from the current state.
     */
    deriveNextPatterns() {
        const possibleNextPatterns = [];
        const currentPatternLength = this.patternString.length;

        // A pattern must have at least two segments to have adjacent colors.
        if (currentPatternLength < 2) {
            return possibleNextPatterns;
        }

        // Iterate through the pattern, checking adjacent segments
        for (let i = 0; i < currentPatternLength - 1; ++i) {
            const segmentA = this.patternString.charAt(i);
            const segmentB = this.patternString.charAt(i + 1);

            // If two adjacent segments have the same color
            if (segmentA === segmentB) {
                let replacementShade = '';
                // Determine the third color that is different from segmentA (and segmentB)
                for (const colorOption of COLOR_CODES) {
                    if (colorOption !== segmentA) {
                        replacementShade = colorOption;
                        break;
                    }
                }

                // This check ensures a replacement shade was found, which should always be true
                // given there are 3 distinct colors and we replace 2 identical ones.
                if (replacementShade) {
                    // Construct the new pattern: prefix + (new_color * 2) + suffix
                    const prefix = this.patternString.slice(0, i);
                    const suffix = this.patternString.slice(i + 2);
                    const modifiedPattern = `${prefix}${replacementShade}${replacementShade}${suffix}`;
                    possibleNextPatterns.push(modifiedPattern);
                }
            }
        }
        return possibleNextPatterns;
    }
}

/**
 * Implements a Breadth-First Search (BFS) algorithm to find the shortest path
 * from an initial color pattern to a stable (terminal) pattern.
 */
class PathFinder {
    constructor() {
        // Map to store visited SegmentChain states, keyed by their pattern string.
        // This helps in avoiding redundant computations and reconstructing paths.
        this.exploredStates = new Map();
        // Queue for BFS, storing pattern strings to be processed.
        this.processingQueue = [];
        // Tracks the maximum depth explored in the current BFS run.
        this.maxExplorationDepth = 0;
    }

    /**
     * Finds the shortest sequence of transformations to reach a stable pattern.
     * A stable pattern is one from which no further transformations are possible.
     * @param {string} initialPattern The starting color pattern.
     * @returns {SegmentChain | null} The SegmentChain object representing the stable state,
     *                                 or null if no stable state is found (e.g., due to an error).
     */
    findShortestPath(initialPattern) {
        // Basic input validation
        if (typeof initialPattern !== 'string' || initialPattern.length === 0) {
            console.error("PathFinder: Invalid initial pattern provided (must be a non-empty string).");
            return null;
        }

        // Clear previous state for a new search
        this.exploredStates.clear();
        this.processingQueue = [];
        this.maxExplorationDepth = 0;

        try {
            // Initialize the starting node and add it to the visited states and queue
            const startNode = new SegmentChain(initialPattern, 0);
            this.exploredStates.set(initialPattern, startNode);
            this.processingQueue.push(initialPattern);

            // BFS loop
            while (this.processingQueue.length > 0) {
                const currentPatternKey = this.processingQueue.shift(); // Dequeue the next pattern
                const currentNode = this.exploredStates.get(currentPatternKey); // Retrieve its corresponding node

                // This should ideally not happen if logic is sound, but good for robustness
                if (!currentNode) {
                    console.warn(`PathFinder: Encountered an unrecorded pattern in queue: ${currentPatternKey}. Skipping.`);
                    continue;
                }

                // Update max depth reached
                this.maxExplorationDepth = Math.max(this.maxExplorationDepth, currentNode.transitionCost);

                // Generate all possible next patterns from the current node
                const neighborPatterns = currentNode.deriveNextPatterns();

                // If no next patterns can be derived, this is a stable (terminal) state.
                // This is the goal state for this problem.
                if (neighborPatterns.length === 0) {
                    return currentNode; // Return the stable segment chain
                }

                // Process each neighbor pattern
                for (const nextPattern of neighborPatterns) {
                    // Only add to queue if this pattern hasn't been visited yet
                    if (!this.exploredStates.has(nextPattern)) {
                        const newCost = currentNode.transitionCost + 1;
                        const nextNode = new SegmentChain(nextPattern, newCost);
                        this.exploredStates.set(nextPattern, nextNode);
                        this.processingQueue.push(nextPattern);
                    }
                }
            }

            // If the queue becomes empty and no terminal state was found,
            // it means all reachable states were explored without finding a stable one.
            return null;

        } catch (error) {
            console.error(`PathFinder: An error occurred during pathfinding for "${initialPattern}": ${error.message}`);
            return null;
        }
    }
}

/**
 * Processes a single input scenario, finds the shortest path to a stable state,
 * and logs the result.
 * @param {string} scenarioInput The color pattern string for this scenario.
 */
function processSingleScenario(scenarioInput) {
    if (scenarioInput === '0') {
        // Special handling for the '0' input, as per problem spec
        console.log("Note: Input '0' received. This scenario is skipped.");
        return;
    }

    try {
        const solver = new PathFinder();
        const finalStableState = solver.findShortestPath(scenarioInput);

        if (finalStableState) {
            console.log(`Scenario "${scenarioInput}" => Resolved in ${finalStableState.transitionCost} steps.`);
        } else {
            console.log(`Scenario "${scenarioInput}" => Could not be resolved. Result: NA`);
        }
    } catch (error) {
        console.error(`Error processing scenario "${scenarioInput}": ${error.message}`);
        console.log(`Scenario "${scenarioInput}" => Processing failed. Result: NA`);
    }
}

/**
 * Main function to orchestrate reading input and solving all puzzle scenarios.
 */
function executePuzzleSolver() {
    // Determine input source: command line argument or default to /dev/stdin
    const inputFilePath = process.argv[2] || '/dev/stdin';
    const rawInputData = getRawInput(inputFilePath);

    // Split input into individual scenarios, filtering out empty lines
    const puzzleScenarios = rawInputData.trim().split('\n').filter(line => line.length > 0);

    if (puzzleScenarios.length === 0) {
        console.log("No valid puzzle scenarios were provided in the input. Exiting.");
        return;
    }

    console.log(`--- Starting processing for ${puzzleScenarios.length} scenarios from ${inputFilePath} ---`);

    // Process each scenario sequentially
    puzzleScenarios.forEach((scenario, index) => {
        console.log(`\n--- Scenario ${index + 1}/${puzzleScenarios.length} ---`);
        processSingleScenario(scenario);
    });

    console.log("\n--- All puzzle scenarios processed. ---");
}

// Execute the main solver function when the script runs
executePuzzleSolver();