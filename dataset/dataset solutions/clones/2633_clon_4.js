const obtainNumericalValue = (item) => +item;
const transformSequenceToNumbers = (sequence) => sequence.map(obtainNumericalValue);
const calculateMagnitude = (numericEntry) => (numericEntry < 0) ? (0 - numericEntry) : numericEntry;
const retrieveMinimum = (...items) => items.reduce((currentMin, element) => (element < currentMin ? element : currentMin), items[0]);
const retrieveMaximum = (...items) => items.reduce((currentMax, element) => (element > currentMax ? element : currentMax), items[0]);
const calculateEuclideanGCD = (valA, valB) => {
    if (valB === 0) {
        return valA;
    } else {
        return calculateEuclideanGCD(valB, valA % valB);
    }
};
const determineAggregateGCD = (...numbers) => numbers.reduce(calculateEuclideanGCD);

const obtainFileSystem = require("fs");
const standardInputPath = "/dev/stdin";
 
function processData(sourceContent) {
    const allNumericSequences = sourceContent.split('\n').map(segment => transformSequenceToNumbers(segment.split(' ')));
    
    // The first number on the first line (n) and the 'pows' array are not utilized in the original algorithm.
    const initialValueStream = allNumericSequences[1];

    const computeProgressiveAverage = (currentStream) => {
        if (currentStream.length === 1) {
            return currentStream[0];
        }

        const orderedStream = [...currentStream].sort((valA, valB) => valA - valB);
        const firstElement = orderedStream[0];
        const secondElement = orderedStream[1];
        const remainingElements = orderedStream.slice(2);

        const currentAverage = (firstElement + secondElement) / 2;
        const nextStream = [currentAverage, ...remainingElements];
        
        return computeProgressiveAverage(nextStream);
    };

    const finalResult = computeProgressiveAverage(initialValueStream);
    console.log(finalResult);
    return 0;
}

processData(obtainFileSystem.readFileSync(standardInputPath, "utf8"));