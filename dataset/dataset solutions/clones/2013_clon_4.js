const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let inputSegments = acquireSourceData();

const pullNextSegment = () => {
    if (inputSegments.length === 0) {
        throw new Error("Input exhausted.");
    }
    return inputSegments.shift();
};

const parseSegmentAsInteger = () => parseInt(pullNextSegment(), 10);

const calculateDivisors = (numberToExamine) => {
    if (numberToExamine < 1) {
        return [];
    }
    return Array.from({ length: numberToExamine }, (_, currentIdx) => currentIdx + 1)
                .filter(candidate => numberToExamine % candidate === 0);
};

const presentOutcome = (finalValue) => console.log(finalValue);

(function initiateProcessing() {
    const initialNumericValue = parseSegmentAsInteger();
    const targetForDivisorCount = initialNumericValue - 1;

    const discoveredDivisors = calculateDivisors(targetForDivisorCount);
    
    const resultForDisplay = discoveredDivisors.length + 1; 
    
    presentOutcome(resultForDisplay);
})();