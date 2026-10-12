const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

function computeQuadraticSum(valX, valY, valZ) {
    const sqX = valX * valX;
    const sqY = valY * valY;
    const sqZ = valZ * valZ;
    return sqX + sqY + sqZ + valX * valY + valY * valZ + valZ * valX;
}

function getIncrementFactor(valX, valY, valZ) {
    if (valX === valY && valY === valZ) {
        return 1;
    } else if (valX === valY || valY === valZ || valZ === valX) {
        return 3;
    } else {
        return 6;
    }
}

function solveProblem() {
    const [targetN] = parseInputData();

    const solutionCounts = new Array(targetN + 1).fill(0);

    for (let currentN = 1; currentN <= targetN; currentN++) {
        for (let coordX = 1; coordX <= 100; coordX++) {
            const sqX = coordX * coordX;
            for (let coordY = coordX; coordY <= 100; coordY++) {
                const sqY = coordY * coordY;
                for (let coordZ = coordY; coordZ <= 100; coordZ++) {

                    const calculatedN = computeQuadraticSum(coordX, coordY, coordZ);

                    if (calculatedN > currentN) {
                        break;
                    }

                    if (calculatedN === currentN) {
                        const increment = getIncrementFactor(coordX, coordY, coordZ);
                        solutionCounts[currentN] += increment;
                        break;
                    }
                }
            }
        }
    }

    return solutionCounts.slice(1).join('\n');
}

let tokenizedInput = fileContent.split(/[\s\n]/);
let loopGuardCounter = 0;
let finalResult = solveProblem();
console.log(finalResult);

if (finalResult === undefined) {
    console.warn("result is undefined");
}

function parseInputData(rows = 1, cols = 1, type = Number) {
    const totalLength = rows * cols;
    let extractedTokens = tokenizedInput.splice(0, totalLength);

    if (type !== String) {
        extractedTokens = extractedTokens.map(type);
    }

    if (cols > 1) {
        const columnArrays = Array.from({ length: cols }, () => []);
        for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
            for (let colIdx = 0; colIdx < cols; colIdx++) {
                columnArrays[colIdx].push(extractedTokens[rowIdx * cols + colIdx]);
            }
        }
        extractedTokens = columnArrays;
    }

    return extractedTokens;
}

function formatBooleanAsYesNo(valueCondition) {
    return valueCondition ? 'Yes' : 'No';
}

function sumArrayElements(numericArray) {
    let currentSum = 0;
    for (const num of numericArray) {
        currentSum += num;
    }
    return currentSum;
}

function preventInfiniteLoop(maxIterations = 1e5) {
    loopGuardCounter++;
    if (loopGuardCounter >= maxIterations) {
        throw new Error("Infinite loop");
    }
}

function findArrayMax(numericArray, initialValue = null) {
    let maxValue = (initialValue === null) ? numericArray[0] : initialValue;
    for (const currentNum of numericArray) {
        if (currentNum > maxValue) {
            maxValue = currentNum;
        }
    }
    return maxValue;
}

function findArrayMin(numericArray, initialValue = null) {
    let minValue = (initialValue === null) ? numericArray[0] : initialValue;
    for (const currentNum of numericArray) {
        if (currentNum < minValue) {
            minValue = currentNum;
        }
    }
    return minValue;
}

function logObjectSnapshot(objectToLog) {
    console.log(JSON.parse(JSON.stringify(objectToLog)));
}

function getPrimeFactors(numberToFactor) {
    const factorsMap = {};

    let tempNum = numberToFactor;

    for (let i = 2; i * i <= tempNum; i++) {
        if (tempNum % i === 0) {
            let currentFactor = i;
            factorsMap[currentFactor] = 0;
            
            while (tempNum % currentFactor === 0) {
                tempNum /= currentFactor;
                factorsMap[currentFactor]++;
            }
        }
    }

    if (tempNum > 1) {
        factorsMap[tempNum] = 1;
    }

    return factorsMap;
}

function create2DArray(xDimension, yDimension = 0, initialValue = 0) {
    const twoDArray = Array.from({ length: xDimension }, () => {
        return yDimension ? new Array(yDimension).fill(initialValue) : [];
    });

    return twoDArray;
}

function greatestCommonDivisor(numA, numB) {
    if (numB === 0) return numA;
    return greatestCommonDivisor(numB, numA % numB);
}

function leastCommonMultiple(numA, numB) {
    const calculateGCD_inline = (n, m) => m ? calculateGCD_inline(m, n % m) : n;
    return numA * numB / calculateGCD_inline(numA, numB);
}

function isSupersetOf(mainSet, subSet) {
    for (let element of subSet) {
        if (!mainSet.has(element)) {
            return false;
        }
    }
    return true;
}

function unionSets(setA, setB) {
    const unionResult = new Set(setA);
    for (const element of setB) {
        unionResult.add(element);
    }
    return unionResult;
}

function intersectSets(setA, setB) {
    let intersectionResult = new Set();
    for (let element of setB) {
        if (setA.has(element)) {
            intersectionResult.add(element);
        }
    }
    return intersectionResult;
}

function symmetricDifferenceSets(setA, setB) {
    let symDiffResult = new Set(setA);
    for (let element of setB) {
        if (symDiffResult.has(element)) {
            symDiffResult.delete(element);
        } else {
            symDiffResult.add(element);
        }
    }
    return symDiffResult;
}

function differenceSets(setA, setB) {
    let diffResult = new Set(setA);
    for (let element of setB) {
        diffResult.delete(element);
    }
    return diffResult;
}

function generateCombinations(sourceArray, combinationCount) {
    
    const allCombinations = [];

    function _recursiveCombinationGenerator({ currentCombination = [], remainingElements }) {

        if (currentCombination.length + remainingElements.length < combinationCount) return;

        if (currentCombination.length < combinationCount) {
            for (let i = 0; i < remainingElements.length; i++) {
                _recursiveCombinationGenerator({
                    currentCombination: [...currentCombination, remainingElements[i]],
                    remainingElements: remainingElements.slice(0,i)
                });
            }
        } else {
            allCombinations.push(currentCombination);
        }
    }

    _recursiveCombinationGenerator({ remainingElements: sourceArray });

    return allCombinations;
}

function calculatePermutation(totalItems, itemsToChoose) {
    let permutationResult = 1;
    for (let i = 0; i < itemsToChoose; i++) {
        permutationResult *= totalItems - i;
    }
    return permutationResult;
}

function calculateCombination(totalItems, itemsToChoose) {
    return calculatePermutation(totalItems, itemsToChoose) / calculatePermutation(itemsToChoose, itemsToChoose);
}
