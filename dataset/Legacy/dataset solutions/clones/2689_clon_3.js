function processInput(rawData) {
    const parsedLines = rawData.split("\n").map(line => line.split(" ").map(val => parseInt(val)));
    const budgetK = parsedLines[0][1];
    const numArr = parsedLines[1];

    const maxElementVal = findMaximum(numArr);
 
    const balanceValue = calculateMinBalance(numArr);
    const maxPossibleG = Math.min(maxElementVal + budgetK, maxElementVal + balanceValue);
    
    let currentGVal = maxPossibleG;
    let finalResult = 1; 

    while (currentGVal > 1) {
        if (checkDivisibilityCondition(currentGVal, numArr, budgetK)) {
            finalResult = currentGVal;
            break; 
        }
        currentGVal--;
    }
    console.log(finalResult);
}

function calculateMinBalance(inputNumbers) {
    const sortedNums = [...inputNumbers]; 
    sortedNums.sort(); 

    let leftPartitionSum = 0;
    let rightPartitionSum = 0;
    let rightPtr = sortedNums.length - 1;
    
    if (sortedNums.length > 0) {
        rightPartitionSum = sortedNums[rightPtr];
    }

    for (let leftPtr = 0; leftPtr < rightPtr; leftPtr++) {
        leftPartitionSum += leftPtr; 
        
        if (leftPartitionSum <= rightPartitionSum) {
            continue;
        } else {
            rightPtr--;
            while (rightPartitionSum < leftPartitionSum && rightPtr > leftPtr) {
                rightPartitionSum += sortedNums[rightPtr];
                rightPtr--;
            }
        }
    }
    return Math.min(leftPartitionSum, rightPartitionSum);
}

function findMaximum(inputArray) {
    const maxReducer = (accumulator, currentVal) => Math.max(accumulator, currentVal);
    return inputArray.reduce(maxReducer);
}

function checkDivisibilityCondition(divisorCandidate, originalNumbers, costBudget) {
    const modPairs = [];
    let remainingBudget = 2 * costBudget; 

    for (let idx = 0; idx < originalNumbers.length; idx++) {
        const currentNumber = originalNumbers[idx];
        const remainderOne = currentNumber % divisorCandidate;
        
        if (remainderOne === 0) {
            continue;
        }
        
        const remainderTwo = divisorCandidate - remainderOne;
        const minRemainderCost = Math.min(remainderOne, remainderTwo);

        if (costBudget < minRemainderCost) {
            return false;
        }
        
        remainingBudget -= minRemainderCost;
        if (remainingBudget < 0) {
            return false;
        }
        
        modPairs.push([remainderOne, remainderTwo]);
    }
    return explorePaths(modPairs, 0, 0, 0, costBudget);
}

function explorePaths(modPairList, currentLevel, currentLeftCost, currentRightCost, totalBudget) {
    if (currentLeftCost > totalBudget || currentRightCost > totalBudget) {
        return false;
    }
    if (currentLevel === modPairList.length) {
        return currentLeftCost === currentRightCost;
    }

    const currentPair = modPairList[currentLevel];
    const nextLevel = currentLevel + 1;

    const tryLeftBranch = () => explorePaths(modPairList, nextLevel, currentLeftCost + currentPair[0], currentRightCost, totalBudget);
    const tryRightBranch = () => explorePaths(modPairList, nextLevel, currentLeftCost, currentRightCost + currentPair[1], totalBudget);

    if (currentLeftCost < currentRightCost) {
        return tryLeftBranch() || tryRightBranch();
    } else {
        return tryRightBranch() || tryLeftBranch();
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
