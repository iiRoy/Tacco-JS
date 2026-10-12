const readStandardInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

const MAX_VALUE_LIMIT = 1000001;

const recursiveGCDHelper = (firstNum, secondNum) => {
    while (secondNum !== 0) {
        const tempVal = secondNum;
        secondNum = firstNum % secondNum;
        firstNum = tempVal;
    }
    return firstNum;
};

const calculateGCD = (...numbersToGCD) => {
    if (numbersToGCD.length === 0) {
        return 0;
    }
    let resultantGCD = numbersToGCD[0];
    for (let currentIdx = 1; currentIdx < numbersToGCD.length; currentIdx++) {
        resultantGCD = recursiveGCDHelper(resultantGCD, numbersToGCD[currentIdx]);
    }
    return resultantGCD;
};

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const elementCount = Number(inputLines[0]);
    const numberArray = inputLines[1].split(" ").map(Number);

    if (calculateGCD(...numberArray) !== 1) {
        console.log("not coprime");
        return;
    }
        
    const occurrenceCounts = new Array(MAX_VALUE_LIMIT).fill(0);
    for (const currentNum of numberArray) {
        if (currentNum === 1) {
            continue;
        }
        occurrenceCounts[currentNum]++;
        if (occurrenceCounts[currentNum] > 1) {
            console.log("setwise coprime");
            return;
        }
    }
    
    for (let primeCandidate = 2; primeCandidate < MAX_VALUE_LIMIT; primeCandidate++) {
        let divisorOccurrences = 0;
        for (let multipleValue = primeCandidate; multipleValue < MAX_VALUE_LIMIT; multipleValue += primeCandidate) {
            divisorOccurrences += occurrenceCounts[multipleValue];
            if (divisorOccurrences >= 2) {
                console.log("setwise coprime");
                return;
            }
        }
    }
    
    console.log("pairwise coprime");
    
}

processInputData(readStandardInput());
