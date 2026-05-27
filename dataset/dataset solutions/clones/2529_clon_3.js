const fs = require('fs');

const parseInputNumbers = (filePath) => {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const inputLines = rawData.split('\n');
    const firstLineParts = inputLines.shift().split(' ');
    const valA = Number(firstLineParts[0]);
    const valB = Number(firstLineParts[1]);
    return { valA, valB };
};

const calculateDivisors = (nVal) => {
    const divisorList = [];
    const limit = Math.sqrt(nVal);
    for (let idx = 1; idx <= limit; idx++) {
        if (nVal % idx === 0) {
            divisorList.push(idx);
            const complementaryDivisor = nVal / idx;
            if (idx !== complementaryDivisor) {
                divisorList.push(complementaryDivisor);
            }
        }
    }
    return divisorList.sort((val1, val2) => val1 - val2);
};

const checkIfPrime = (numToCheck) => {
    if (numToCheck < 2) {
        return false;
    }
    if (numToCheck === 2) {
        return true;
    }
    if (numToCheck % 2 === 0) {
        return false;
    }
    const limit = Math.sqrt(numToCheck);
    for (let idx = 3; idx <= limit; idx += 2) {
        if (numToCheck % idx === 0) {
            return false;
        }
    }
    return true;
};

const computeGCD = (valM, valN) => {
    let tempVal;
    while (valM % valN !== 0) {
        tempVal = valN;
        valN = valM % valN;
        valM = tempVal;
    }
    return valN;
};

const { valA: numA, valB: numB } = parseInputNumbers('/dev/stdin');

const divisorsOfA = calculateDivisors(numA);
const divisorsOfB = calculateDivisors(numB);

const commonDivisors = [];
let currentDivA = divisorsOfA.pop();
let currentDivB = divisorsOfB.pop();

while (currentDivA !== 1 || currentDivB !== 1) {
    if (currentDivA === currentDivB) {
        commonDivisors.push(currentDivA);
        currentDivA = divisorsOfA.pop();
        currentDivB = divisorsOfB.pop();
    } else if (currentDivA < currentDivB) {
        currentDivB = divisorsOfB.pop();
    } else {
        currentDivA = divisorsOfA.pop();
    }
}

const initialPrimeCount = 1;
const primeCommonDivisorCount = commonDivisors.reduce((count, divisor) => {
    return checkIfPrime(divisor) ? count + 1 : count;
}, initialPrimeCount);

console.log(primeCommonDivisorCount);
