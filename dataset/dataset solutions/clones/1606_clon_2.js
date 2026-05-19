var rawData = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`
// This variable holds the raw input data for processing.
// The original code had commented-out alternative inputs,
// but the final active input is preserved here.

const textLines = rawData.split('\n'); // Split the input string into an array of lines.
let [numElements, maxSteps] = textLines[0].split(' ').map(Number); // Parse N and K from the first line.
const pathArray = textLines[1].split(' ').map(Number); // Parse P array from the second line.
const costArray = textLines[2].split(' ').map(Number); // Parse C array from the third line.

// Add a null placeholder at the beginning of both arrays.
// This is to make them 1-indexed, matching problem description.
pathArray.unshift(null);
costArray.unshift(null);

/**
 * Calculates the maximum score achievable starting from a given node.
 * @param {number} initialNode The starting node for the path traversal.
 * @returns {number} The maximum score obtained.
 */
const calculateMaxScore = (initialNode) => {
    const visitedNodes = {}; // Object to keep track of visited nodes in the current path.
    let currentNode = initialNode; // Current node in the traversal.
    let currentScore = 0; // Accumulated score along the path.
    let highestScore = -1000000000; // Tracks the maximum score encountered.
    let isLooped = false; // Flag to indicate if a loop has been detected.
    let stepCounter = 0; // Counter for the number of steps taken.

    // Traverse the path for up to maxSteps steps or until a loop is detected.
    for (stepCounter; stepCounter < maxSteps; stepCounter++) {
        visitedNodes[currentNode] = true; // Mark the current node as visited.
        currentNode = pathArray[currentNode]; // Move to the next node as per pathArray.
        currentScore += costArray[currentNode]; // Add the cost of the new node to the current score.
        highestScore = Math.max(highestScore, currentScore); // Update highest score if current score is greater.

        // If the next node (currentNode) has already been visited in this path, a loop is found.
        if (visitedNodes[currentNode]) {
            isLooped = true;
            break; // Exit the loop as the cycle is complete.
        }
    }

    // If no loop was detected within maxSteps, the highest score found is the answer.
    if (!isLooped) {
        return highestScore;
    }

    // If a loop was detected and the total score of the loop is negative,
    // it's always better to not repeat the loop, so return the highest score before looping.
    if (currentScore < 0) {
        return highestScore;
    }

    // If a loop was detected and its total score is positive,
    // we can potentially repeat the loop multiple times.
    // Calculate how many full loop repetitions can occur.
    const loopLength = stepCounter + 1; // The number of steps in the detected loop.
    const loopIterations = maxSteps % loopLength ? Math.floor(maxSteps / loopLength) : (maxSteps / loopLength) - 1;

    // Reset variables for calculating the score after full loop repetitions.
    currentNode = initialNode;
    var tempScore = 0; // Temporary score for the remaining steps.
    var tempHighest = -1000000000; // Temporary highest score for the remaining steps.
    var remainingSteps = maxSteps % loopLength; // Steps remaining after full loop repetitions.
    stepCounter = 0; // Reset step counter for the remaining steps.

    // Traverse the remaining steps.
    for (stepCounter; stepCounter < remainingSteps; stepCounter++) {
        currentNode = pathArray[currentNode];
        tempScore += costArray[currentNode];
        tempHighest = Math.max(tempHighest, tempScore);
    }

    // Calculate the maximum score considering full loop repetitions and remaining steps.
    // Option 1: (loopIterations - 1) full loops + highest score within one loop + remaining steps.
    // Option 2: loopIterations full loops + highest score within the remaining steps.
    return Math.max(currentScore * (loopIterations - 1) + highestScore, currentScore * loopIterations + tempHighest);
};

let finalResult = -1000000000; // Initialize the overall maximum score.

// Iterate through all possible starting points (nodes 1 to N).
for (let startingPoint = 1; startingPoint <= numElements; startingPoint++) {
    finalResult = Math.max(finalResult, calculateMaxScore(startingPoint)); // Update overall max score.
}

console.log(finalResult); // Output the final maximum score.
