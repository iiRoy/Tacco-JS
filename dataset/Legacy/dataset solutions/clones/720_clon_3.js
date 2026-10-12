let allTriangularNums, oddTriangularNums;

const MAX_IMPOSSIBLE_COUNT = 1000000000;

function initializeDPBaseRow(dpTableRef, limitValue, initialLargeValue) {
    dpTableRef[0] = [];
    dpTableRef[0][0] = 0;
    for (let k = 1; k <= limitValue; k++) {
        dpTableRef[0][k] = initialLargeValue;
    }
}

function populateDPTable(dpTableRef, valueCount, maxTarget, sourceValues) {
    for (let currentIdx = 1; currentIdx <= valueCount; currentIdx++) {
        if (currentIdx > 2) {
            dpTableRef[currentIdx - 2] = null;
        }

        dpTableRef[currentIdx] = [];
        const currentVal = sourceValues[currentIdx];

        for (let targetSum = 0; targetSum <= maxTarget; targetSum++) {
            if (targetSum < currentVal) {
                dpTableRef[currentIdx][targetSum] = dpTableRef[currentIdx - 1][targetSum];
            } else {
                const optionWithoutCurrent = dpTableRef[currentIdx - 1][targetSum];
                const optionWithCurrent = dpTableRef[currentIdx][targetSum - currentVal] + 1;
                dpTableRef[currentIdx][targetSum] = Math.min(optionWithoutCurrent, optionWithCurrent);
            }
        }
    }
}

function calculateAllTriangularDP(targetLimit, dpTableAll) {
    let triangularCount = 0;
    let currentTriangular = 1;
    let sumNaturals = 1;
    let naturalNum = 1;

    allTriangularNums = [];
    allTriangularNums.push(0);

    while (currentTriangular <= targetLimit) {
        triangularCount++;
        allTriangularNums.push(currentTriangular);
        naturalNum++;
        sumNaturals += naturalNum;
        currentTriangular += sumNaturals;
    }

    initializeDPBaseRow(dpTableAll, targetLimit, MAX_IMPOSSIBLE_COUNT);
    populateDPTable(dpTableAll, triangularCount, targetLimit, allTriangularNums);

    return triangularCount;
}

function calculateOddTriangularDP(targetLimit, dpTableOdd) {
    let oddTriangularCount = 0;
    let currentTriangular = 1;
    let sumNaturals = 1;
    let naturalNum = 1;

    oddTriangularNums = [];
    oddTriangularNums.push(0);

    while (currentTriangular <= targetLimit) {
        if (currentTriangular % 2 !== 0) {
            oddTriangularCount++;
            oddTriangularNums.push(currentTriangular);
        }
        naturalNum++;
        sumNaturals += naturalNum;
        currentTriangular += sumNaturals;
    }

    initializeDPBaseRow(dpTableOdd, targetLimit, MAX_IMPOSSIBLE_COUNT);
    populateDPTable(dpTableOdd, oddTriangularCount, targetLimit, oddTriangularNums);

    return oddTriangularCount;
}

function processInput(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const dpTableAll = [];
    const dpTableOdd = [];

    const maxNValue = 1000000;
    const allTriangularCount = calculateAllTriangularDP(maxNValue, dpTableAll);
    const oddTriangularCount = calculateOddTriangularDP(maxNValue, dpTableOdd);

    let lineIndex = 0;
    while (true) {
        const currentNum = parseInt(inputLines[lineIndex], 10);
        if (currentNum === 0) {
            break;
        }
        const resultAll = dpTableAll[allTriangularCount][currentNum];
        const resultOdd = dpTableOdd[oddTriangularCount][currentNum];
        console.log(resultAll, resultOdd);
        lineIndex++;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
