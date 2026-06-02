'use strict';

const factorCount = (val) => {
    return Array.from({ length: val }, (_, testDivisor) => testDivisor + 1)
                .filter(d => val % d === 0)
                .length;
};

const processInputData = (rawData) => {
    const upperBound = Number(rawData);
    
    const totalMatches = Array.from({ length: upperBound + 1 }, (_, currentNumber) => currentNumber)
                                .filter(num => num % 2 !== 0)
                                .filter(num => factorCount(num) === 8)
                                .length;

    console.log(totalMatches);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
