const dataHandler = require('fs');
const rawData = dataHandler.readFileSync('/dev/stdin', 'utf-8');
const inputLines = rawData.split('\n');

const totalCases = parseInt(inputLines[0], 10);

let currentCostForTwo;
let currentCostForThree;
let currentCostForFive;
let currentCostForRemainder;

let memoizationMap;

function findOptimalCost(targetNumber) {
    if (targetNumber <= 1) {
        return 0;
    }

    if (memoizationMap.has(targetNumber)) {
        return memoizationMap.get(targetNumber);
    }

    let bestAchievedCost = Infinity;

    // Operation 1: Division by 2
    // Path 1a: Floor division
    const remainderTwoFloor = targetNumber % 2;
    const quotientTwoFloor = Math.floor(targetNumber / 2);
    const costPathTwoFloor = currentCostForTwo + currentCostForRemainder * remainderTwoFloor;
    bestAchievedCost = Math.min(bestAchievedCost, costPathTwoFloor + findOptimalCost(quotientTwoFloor));

    // Path 1b: Ceil division (mimicking original's P2+1 logic)
    const quotientTwoCeil = quotientTwoFloor + (remainderTwoFloor > 0 ? 1 : 0);
    const remainderTwoCeil = targetNumber - quotientTwoCeil * 2;
    const costPathTwoCeil = currentCostForTwo + currentCostForRemainder * remainderTwoCeil;
    bestAchievedCost = Math.min(bestAchievedCost, costPathTwoCeil + findOptimalCost(quotientTwoCeil));

    // Operation 2: Division by 3
    // Path 2a: Floor division
    const remainderThreeFloor = targetNumber % 3;
    const quotientThreeFloor = Math.floor(targetNumber / 3);
    const costPathThreeFloor = currentCostForThree + currentCostForRemainder * remainderThreeFloor;
    bestAchievedCost = Math.min(bestAchievedCost, costPathThreeFloor + findOptimalCost(quotientThreeFloor));

    // Path 2b: Ceil division (mimicking original's P2+1 logic)
    const quotientThreeCeil = quotientThreeFloor + (remainderThreeFloor > 0 ? 1 : 0);
    const remainderThreeCeil = targetNumber - quotientThreeCeil * 3;
    const costPathThreeCeil = currentCostForThree + currentCostForRemainder * remainderThreeCeil;
    bestAchievedCost = Math.min(bestAchievedCost, costPathThreeCeil + findOptimalCost(quotientThreeCeil));

    // Note: Division by 5 operation is commented out in the original code, so it's omitted here.

    memoizationMap.set(targetNumber, bestAchievedCost);
    return bestAchievedCost;
}

for (let caseIndex = 1; caseIndex <= totalCases; caseIndex++) {
    const caseData = inputLines[caseIndex].split(' ').map(Number);
    const initialValue = caseData[0];
    currentCostForTwo = caseData[1];
    currentCostForThree = caseData[2];
    currentCostForFive = caseData[3]; // Parsed but not used in calculations (matches original)
    currentCostForRemainder = caseData[4];

    memoizationMap = new Map();

    const finalMinimumCost = findOptimalCost(initialValue);
    console.log(finalMinimumCost);
}