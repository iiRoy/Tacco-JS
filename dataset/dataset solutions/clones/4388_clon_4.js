function acquireInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function displayResult(content){console.log(content);}

const conversionHandlers = [
    (val) => val, // 0: no operation
    (val) => parseInt(val), // 1: convert to integer
    (val) => val.split(" "), // 2: split by space
    (val) => val.split("\n"), // 3: split by newline
    (val) => val.split(" ").map(Number), // 4: split by space, convert to numbers
    (val) => val.split("\n").map(Number), // 5: split by newline, convert to numbers
    (val) => val.split(""), // 6: split into characters
    (val) => val.split("").map(Number) // 7: split into characters, convert to numbers
];

function dataTransformer(inputData, transformKey){
    return conversionHandlers[transformKey](inputData);
}

function calculatePatternCount(indicators, length, currentIdx, currentAccumulator) {
    if (length < 2 || currentIdx >= length) {
        return currentAccumulator;
    }

    let nextAccumulator = currentAccumulator;
    const previousValue = indicators[currentIdx - 1];
    const currentValue = indicators[currentIdx];

    if (currentIdx === 1) {
        if (currentValue === 1 || previousValue === 1) {
            nextAccumulator++;
        }
    } else {
        if (previousValue === 0 && currentValue === 1) {
            nextAccumulator++;
        }
    }
    return calculatePatternCount(indicators, length, currentIdx + 1, nextAccumulator);
}

function processSequence(rawContent) {
    const lines = dataTransformer(rawContent, 3);
    const sequenceLength = dataTransformer(lines[0], 1);
    const valueSequence = dataTransformer(lines[1], 4);

    const binaryIndicators = Array.from({ length: sequenceLength }, (_, idx) => {
        return (valueSequence[idx] === idx + 1) ? 1 : 0;
    });

    const finalCount = calculatePatternCount(binaryIndicators, sequenceLength, 1, 0);
    
    displayResult(finalCount);
}

processSequence(acquireInput());
