let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Helper for checking if a number is odd
const isOdd = (num) => num % 2 !== 0;

function calculateResult() {
    const [numElements] = parseInput();
    const inputNumbers = parseInput(numElements);

    let oddCount = 0;
    const loopUpperLimit = 100;
    for (let i = 1; i <= loopUpperLimit; i += 2) {
        const zeroBasedIndex = i - 1;
        const currentVal = inputNumbers[zeroBasedIndex];
        if (isOdd(currentVal)) {
            oddCount++;
        }
    }
    return oddCount;
}

let tokenizedInput = fileContent.split(/[\s\n]/);
let loopGuardCounter = 0;

let finalOutput = calculateResult();
console.log(finalOutput);

// Helper for undefined result warning
const warnIfUndefined = (val, message = "result is undefined") => {
    if (val === undefined) {
        console.warn(message);
    }
};
warnIfUndefined(finalOutput);


// Input parsing function
function parseInput(rows = 1, cols = 1, valueType = Number) {
    const requiredLength = rows * cols;
    let rawTokens = tokenizedInput.splice(0, requiredLength);

    if (valueType !== String) {
        rawTokens = rawTokens.map(valueType);
    }

    if (cols > 1) {
        const multiDimArray = Array.from({ length: cols }, (_, colIdx) => {
            const colArray = [];
            for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
                colArray.push(rawTokens[rowIdx * cols + colIdx]);
            }
            return colArray;
        });
        return multiDimArray;
    }

    return rawTokens;
}

// TruthyならYes, FalsyならNo
function toYesNoString(value) {
    return value ? 'Yes' : 'No';
}

// 数列の和
function sumArrayElements(numbers) {
    return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

// 対無限ループ安全装置
function preventInfiniteLoop(maxIterations = 1e5) {
    loopGuardCounter++;
    if (loopGuardCounter >= maxIterations) {
        throw new Error("Infinite loop detected");
    }
}

// 配列の中から最大値を返す
function findArrayMax(numbers, initialValue = null) {
    if (numbers.length === 0 && initialValue === null) {
        return undefined;
    }
    let currentMax = (initialValue !== null) ? initialValue : numbers[0];
    for (const num of numbers) {
        if (num > currentMax) {
            currentMax = num;
        }
    }
    return currentMax;
}

// 配列の中から最小値を返す
function findArrayMin(numbers, initialValue = null) {
    if (numbers.length === 0 && initialValue === null) {
        return undefined;
    }
    let currentMin = (initialValue !== null) ? initialValue : numbers[0];
    for (const num of numbers) {
        if (num < currentMin) {
            currentMin = num;
        }
    }
    return currentMin;
}

// オブジェクトのスナップショットをconsole.logする
function logObjectSnapshot(value) {
    console.log(JSON.parse(JSON.stringify(value)));
}

// 素因数分解 { 素数: n乗 }
function getPrimeFactors(numberToFactor) {
    const factorsMap = {};
    let tempNum = numberToFactor;

    for (let divisor = 2; divisor * divisor <= tempNum; divisor++) {
        if (tempNum % divisor === 0) {
            factorsMap[divisor] = 0;
            while (tempNum % divisor === 0) {
                tempNum /= divisor;
                factorsMap[divisor]++;
            }
        }
    }

    if (tempNum > 1) {
        factorsMap[tempNum] = 1;
    }

    return factorsMap;
}

// 2次元配列を作る
function create2DArray(xDimension, yDimension = 0, initialValue = 0) {
    const newArray = Array.from({ length: xDimension }, () => {
        return yDimension ? new Array(yDimension).fill(initialValue) : [];
    });
    return newArray;
}

// 最大公約数
function greatestCommonDivisor(valA, valB) {
    if (valB === 0) return valA;
    return greatestCommonDivisor(valB, valA % valB);
}

// 最小公倍数
function leastCommonMultiple(valA, valB) {
    const calculateGcdInternal = (n, m) => {
        if (m === 0) return n;
        return calculateGcdInternal(m, n % m);
    };
    return (valA * valB) / calculateGcdInternal(valA, valB);
}

// subsetはsetの部分集合である
function isSupersetOf(mainSet, subSet) {
    for (let element of subSet) {
        if (!mainSet.has(element)) {
            return false;
        }
    }
    return true;
}

// 和集合
function unionSets(set1, set2) {
    const unionResult = new Set(set1);
    for (const element of set2) {
        unionResult.add(element);
    }
    return unionResult;
}

// 積集合
function intersectSets(set1, set2) {
    let intersectionResult = new Set();
    for (let element of set2) {
        if (set1.has(element)) {
            intersectionResult.add(element);
        }
    }
    return intersectionResult;
}

// 対称差集合
function symmetricDifferenceSets(set1, set2) {
    let symDiffResult = new Set(set1);
    for (let element of set2) {
        if (symDiffResult.has(element)) {
            symDiffResult.delete(element);
        } else {
            symDiffResult.add(element);
        }
    }
    return symDiffResult;
}

// 差集合
function differenceSets(set1, set2) {
    let diffResult = new Set(set1);
    for (let element of set2) {
        diffResult.delete(element);
    }
    return diffResult;
}

// 配列からc個取る組み合わせ全列挙
function generateCombinations(sourceArray, combinationCount) {
    const allCombinations = [];

    function _recursiveCombinations({ currentPrefix = [], remainingItems }) {
        if (currentPrefix.length + remainingItems.length < combinationCount) {
            return;
        }

        if (currentPrefix.length === combinationCount) {
            allCombinations.push(currentPrefix);
            return;
        }

        for (let i = 0; i < remainingItems.length; i++) {
            const nextItem = remainingItems[i];
            _recursiveCombinations({
                currentPrefix: [...currentPrefix, nextItem],
                remainingItems: remainingItems.slice(0, i)
            });
        }
    }

    _recursiveCombinations({ remainingItems: sourceArray });

    return allCombinations;
}

function calculatePermutation(nValue, rValue) {
    let permResult = 1;
    for (let k = 0; k < rValue; k++) {
        permResult *= (nValue - k);
    }
    return permResult;
}

function calculateCombination(nValue, rValue) {
    const numerator = calculatePermutation(nValue, rValue);
    const denominator = calculatePermutation(rValue, rValue);
    return numerator / denominator;
}
