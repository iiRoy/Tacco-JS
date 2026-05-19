function processInputData(rawData) {
    const parseInputString = (inputStr) => {
        return inputStr.split("\n").map(line => line.split(" ").map(value => parseInt(value, 10)));
    };

    const parsedLines = parseInputString(rawData);

    const budgetK = parsedLines[0][1];
    const inputNumbers = parsedLines[1];

    const maximumElement = findLargestValue(inputNumbers);
 
    const MIN_DIVISOR_CANDIDATE = 2;

    const potentialGCD = Math.min(maximumElement + budgetK, determineMaxPossibleSum(inputNumbers));
    
    let finalResult = 1;

    for (let currentDivisor = potentialGCD; currentDivisor >= MIN_DIVISOR_CANDIDATE; currentDivisor--) {
        if (checkGCDFeasibility(currentDivisor, inputNumbers, budgetK)) {
            finalResult = currentDivisor;
            break;
        }
    }
    console.log(finalResult);
}

function determineMaxPossibleSum(numList) {
    if (!numList || numList.length === 0) {
        return 0;
    }

    const orderedNumbers = numList.slice().sort((a, b) => a - b);
    
    let leftAccumulator = 0;
    let rightAccumulator = 0;
    
    let rightPointer = orderedNumbers.length - 1;
    
    rightAccumulator = orderedNumbers[rightPointer];
    
    for (let leftPointer = 0; leftPointer < rightPointer; leftPointer++) {
        leftAccumulator += leftPointer; 
        
        if (leftAccumulator <= rightAccumulator) {
            continue;
        } else {
            rightPointer--;
            while (rightAccumulator < leftAccumulator && rightPointer > leftPointer) {
                rightAccumulator += orderedNumbers[rightPointer];
                rightPointer--;
            }
        }
    }
    return Math.min(leftAccumulator, rightAccumulator);
}

function findLargestValue(numList) {
    if (!numList || numList.length === 0) {
        return -Infinity;
    }
    return numList.reduce(function(valA, valB){ return Math.max(valA, valB)});
}

function checkGCDFeasibility(candidateGCD, originalNumbers, initialBudget) {
    const remainderPairs = [];
    let remainingBudget = 2 * initialBudget;

    const getMinRemainderCost = (r1, r2) => Math.min(r1, r2);

    for (let idx = 0; idx < originalNumbers.length; idx++) {
        const currentNumber = originalNumbers[idx];
        const remainderOne = currentNumber % candidateGCD;
        
        if (remainderOne === 0) {
            continue;
        }
        
        const remainderTwo = candidateGCD - remainderOne;
        
        const currentMinCost = getMinRemainderCost(remainderOne, remainderTwo);

        if (initialBudget < currentMinCost) {
            return false;
        }
        
        remainingBudget -= currentMinCost;
        
        if (remainingBudget < 0) {
            return false;
        }
        
        remainderPairs.push([remainderOne, remainderTwo]);
    }
    return explorePathsRecursive(remainderPairs, 0, 0, 0, initialBudget);
}

function explorePathsRecursive(pairsToProcess, currentLevel, currentLeftCost, currentRightCost, totalBudget) {
    if (currentLeftCost > totalBudget) return false;
    if (currentRightCost > totalBudget) return false;
    
    if (currentLevel === pairsToProcess.length) {
        return currentLeftCost === currentRightCost;
    }

    const currentPair = pairsToProcess[currentLevel];
    const costOptionA = currentPair[0];
    const costOptionB = currentPair[1];

    let pathResult = false;

    if (currentLeftCost < currentRightCost) {
        pathResult = explorePathsRecursive(pairsToProcess, currentLevel + 1, currentLeftCost + costOptionA, currentRightCost, totalBudget);
        if (pathResult) return true;
        
        pathResult = explorePathsRecursive(pairsToProcess, currentLevel + 1, currentLeftCost, currentRightCost + costOptionB, totalBudget);
    } else {
        pathResult = explorePathsRecursive(pairsToProcess, currentLevel + 1, currentLeftCost, currentRightCost + costOptionB, totalBudget);
        if (pathResult) return true;

        pathResult = explorePathsRecursive(pairsToProcess, currentLevel + 1, currentLeftCost + costOptionA, currentRightCost, totalBudget);
    }
    
    return pathResult;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
