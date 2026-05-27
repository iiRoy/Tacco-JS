var rawData = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`

const dataLines = rawData.split('\n')

const parseNumbers = (lineString) => lineString.split(' ').map(Number)

let numNodes;
let maxSteps;
[numNodes, maxSteps] = parseNumbers(dataLines[0]);

const nextNodesRaw = parseNumbers(dataLines[1]);
const nodeScoresRaw = parseNumbers(dataLines[2]);

const nextNodes = [null, ...nextNodesRaw];
const nodeScores = [null, ...nodeScoresRaw];

const MIN_POSSIBLE_SCORE = -1000000000;

const calculatePartialPathMaxScore = (startNode, stepsToTake, nextNodesArr, nodeScoresArr, initialMaxScore) => {
    let currentTraversalNode = startNode;
    let currentTraversalSum = 0;
    let currentTraversalMax = initialMaxScore;

    for (let s = 0; s < stepsToTake; s++) {
        currentTraversalNode = nextNodesArr[currentTraversalNode];
        currentTraversalSum += nodeScoresArr[currentTraversalNode];
        currentTraversalMax = Math.max(currentTraversalMax, currentTraversalSum);
    }
    return currentTraversalMax;
};

const calculateMaxScore = (initialNode) => {
    const visitedPathNodes = new Set();
    let currentNode = initialNode;
    let currentPathScore = 0;
    let maxPathScore = MIN_POSSIBLE_SCORE;
    let loopDetected = false;
    let stepCount = 0;
    let loopLength = 0;

    for (stepCount = 0; stepCount < maxSteps; stepCount++) {
        visitedPathNodes.add(currentNode);
        currentNode = nextNodes[currentNode];
        currentPathScore += nodeScores[currentNode];
        maxPathScore = Math.max(maxPathScore, currentPathScore);

        if (visitedPathNodes.has(currentNode)) {
            loopDetected = true;
            loopLength = stepCount + 1;
            break;
        }
    }

    if (!loopDetected) {
        return maxPathScore;
    }

    if (currentPathScore < 0) {
        return maxPathScore;
    }

    const fullLoopIterations = Math.floor((maxSteps - 1) / loopLength);

    const stepsForRemainderPeak = maxSteps % loopLength;
    const remainderMaxScoreForPeak = calculatePartialPathMaxScore(
        initialNode,
        stepsForRemainderPeak,
        nextNodes,
        nodeScores,
        MIN_POSSIBLE_SCORE
    );

    return Math.max(
        currentPathScore * (fullLoopIterations - 1) + maxPathScore,
        currentPathScore * fullLoopIterations + remainderMaxScoreForPeak
    );
};

let finalAnswer = MIN_POSSIBLE_SCORE;
for (let nodeIdx = 1; nodeIdx <= numNodes; nodeIdx++) {
    finalAnswer = Math.max(finalAnswer, calculateMaxScore(nodeIdx));
}
console.log(finalAnswer);
