function processInput(rawData) {
    // Parse the raw input string into a structured array of numbers.
    // Each line is split by space, and each part is converted to an integer.
    var parsedData = rawData.split("\n").map(function(currentLine) {
        return currentLine.split(" ").map(function(numericValue) {
            return parseInt(numericValue, 10); // Explicitly use base 10 for parseInt
        });
    });

    // Extract the threshold value and the main array from the parsed data.
    var thresholdVal = parsedData[0][1];
    var inputNumbers = parsedData[1];

    // Determine the maximum element in the input array.
    var maximumElement = findMaximum(inputNumbers);
 
    // Calculate an upper bound for the potential greatest common divisor (GCD).
    // This helps optimize the search by reducing the range.
    var maximumDivisor = Math.min(maximumElement + thresholdVal, calculateMaxPossible(inputNumbers));

    // Iterate downwards from the calculated maximum divisor candidate.
    // The first divisor that satisfies the condition is the answer.
    for (var divisorCandidate = maximumDivisor; divisorCandidate > 1; divisorCandidate--) {
        if (checkDivisibility(divisorCandidate, inputNumbers, thresholdVal)) {
            // If a valid divisor is found, print it and exit.
            return console.log(divisorCandidate);
        }
    }
    // If no such divisor greater than 1 is found, the answer is 1.
    return console.log(1);
}

// This function attempts to find a specific kind of maximum value related to array partitioning.
// It's not a simple maximum, but rather a value derived from balancing sums of sorted elements.
function calculateMaxPossible(inputCollection) {
    // Create a sorted copy of the input array to avoid modifying the original.
    var orderedCollection = [...inputCollection].sort((a, b) => a - b);
    var leftAccumulator = 0; // Accumulator for the left part of the array.
    var rightAccumulator = 0; // Accumulator for the right part of the array.
    var rightPointer = orderedCollection.length - 1; // Pointer for the right end.

    // Initialize the right accumulator with the largest element.
    rightAccumulator = orderedCollection[rightPointer];

    // Iterate from the left, trying to balance sums.
    for (var leftPointer = 0; leftPointer < rightPointer; leftPointer++) {
        leftAccumulator += leftPointer; // Add the index itself, not the value at the index. This seems unusual.
        if (leftAccumulator <= rightAccumulator) {
            // If left sum is still less or equal, continue adding to it.
            continue;
        } else {
            // If left sum exceeds right sum, move the right pointer inwards
            // and add elements from the right to balance.
            rightPointer--;
            while (rightAccumulator < leftAccumulator && rightPointer > leftPointer) {
                rightAccumulator += orderedCollection[rightPointer];
                rightPointer--;
            }
        }
    }
    // Return the minimum of the two balanced sums.
    return Math.min(leftAccumulator, rightAccumulator);
}

// Finds the maximum value within an array.
function findMaximum(valueList) {
    // Uses reduce to iterate and find the maximum.
    return valueList.reduce(function(currentMax, nextValue) {
        return Math.max(currentMax, nextValue);
    });
}

// Calculates the sum of all elements in an array.
function calculateSum(numberSeries) {
    // Uses reduce to sum all elements, starting with an initial value of 0.
    return numberSeries.reduce(function(accumulator, element) {
        return accumulator + element;
    }, 0);
}

// Checks if a given divisor 'divisorCheck' is valid for the 'sourceArray'
// under the constraint of 'limitValue'.
function checkDivisibility(divisorCheck, sourceArray, limitValue) {
    var remainderPairs = []; // Stores pairs of (mod1, mod2) for each element.
    var remainingBudget = limitValue + limitValue; // Initialize budget (2*k).

    for (var idx = 0; idx < sourceArray.length; idx++) {
        var remainderOne = sourceArray[idx] % divisorCheck; // Remainder when divided by divisorCheck.
        if (remainderOne === 0) {
            // If divisible, no cost incurred, move to the next element.
            continue;
        }
        var remainderTwo = divisorCheck - remainderOne; // Cost to reach the next multiple of divisorCheck.

        // If the cost to make it divisible (either remainderOne or remainderTwo)
        // is greater than the allowed limitValue, then this divisor is invalid.
        if (limitValue < Math.min(remainderOne, remainderTwo)) {
            return false;
        }
        
        // Deduct the minimum cost from the budget.
        remainingBudget -= Math.min(remainderOne, remainderTwo);
        if (remainingBudget < 0) {
            // If budget runs out, this divisor is invalid.
            return false;
        }
        // Store the remainder pair for further processing.
        remainderPairs.push([remainderOne, remainderTwo]);
    }
    // After processing all elements, use a recursive traversal to check if
    // the remaining costs can be balanced within the budget.
    return traversePairs(remainderPairs, 0, 0, 0, limitValue);
}

// Recursive function to explore paths for balancing costs.
function traversePairs(pairList, currentDepth, costLeft, costRight, maxBudget) {
    // Base cases for pruning: if either cost exceeds the budget, this path is invalid.
    if (costLeft > maxBudget) return false;
    if (costRight > maxBudget) return false;

    // Base case for recursion: if all pairs have been processed.
    // The path is valid only if both costs are equal at the end.
    if (currentDepth === pairList.length) {
        return costLeft === costRight;
    }

    // Heuristic: prioritize exploring the path that keeps costs more balanced.
    // This might help in finding a solution faster, but doesn't change correctness.
    if (costLeft < costRight) {
        // If left cost is smaller, try adding to left first, then to right.
        return exploreLeftBranch(pairList, currentDepth, costLeft, costRight, maxBudget) ||
               exploreRightBranch(pairList, currentDepth, costLeft, costRight, maxBudget);
    } else {
        // If right cost is smaller or equal, try adding to right first, then to left.
        return exploreRightBranch(pairList, currentDepth, costLeft, costRight, maxBudget) ||
               exploreLeftBranch(pairList, currentDepth, costLeft, costRight, maxBudget);
    }
    // This line should theoretically not be reached if all conditions are covered.
    // It's a fallback, but the logic above ensures a return.
    // return false;
}

// Explores the path where the first element of the current pair is added to the left cost.
function exploreLeftBranch(dataPairs, currentLevel, currentLeftCost, currentRightCost, totalBudget) {
    return traversePairs(dataPairs, currentLevel + 1, currentLeftCost + dataPairs[currentLevel][0], currentRightCost, totalBudget);
}

// Explores the path where the second element of the current pair is added to the right cost.
function exploreRightBranch(dataPairs, currentLevel, currentLeftCost, currentRightCost, totalBudget) {
    return traversePairs(dataPairs, currentLevel + 1, currentLeftCost, currentRightCost + dataPairs[currentLevel][1], totalBudget);
}

// Main execution point: reads input from stdin and passes it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
