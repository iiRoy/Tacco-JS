function processData(rawData = "") {
    const inputLines = rawData.split("\n");
    const firstLineSegments = inputLines[0].split(" ");
    const maxCutsAllowed = Math.floor(Number(firstLineSegments[1]));

    const valueArray = inputLines[1].split(" ").map((valString) => Math.floor(Number(valString)));

    let lowBound = 1;
    let highBound = valueArray.reduce((accumulator, currentVal) => Math.max(accumulator, currentVal));
    
    const DIVISION_FACTOR = 0.5; 
    let currentMid = Math.floor((highBound + lowBound) * DIVISION_FACTOR);
    let finalResult = highBound;

    const determineCutsPerSegment = (itemValue, segmentLength) => {
        if (segmentLength === 0) {
            return Infinity; 
        }
        // This calculation is equivalent to:
        // let numSegments = Math.floor(itemValue / segmentLength);
        // if (itemValue === numSegments * segmentLength) { numSegments--; }
        // return numSegments;
        return Math.ceil(itemValue / segmentLength) - 1;
    };

    while (lowBound <= highBound) {
        let totalCuts = 0;
        
        for (const currentValue of valueArray) {
            totalCuts += determineCutsPerSegment(currentValue, currentMid);
        }

        if (totalCuts <= maxCutsAllowed) {
            finalResult = currentMid;
            highBound = currentMid - 1;
        } else {
            lowBound = currentMid + 1;
        }
        currentMid = Math.floor((highBound + lowBound) * DIVISION_FACTOR);
    }
    return finalResult;
}

exports.main = processData;

function ExecuteMain(inputContent) {
    console.log(processData(inputContent.trim()));
}

if (process.argv[2] !== "test") {
    ExecuteMain(require("fs").readFileSync("/dev/stdin", "utf8"));
}
