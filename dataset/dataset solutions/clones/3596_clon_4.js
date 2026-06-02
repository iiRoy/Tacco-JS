const parseInteger = (textValue) => parseInt(textValue, 10);
const parseIntegerArray = (stringCollection) => stringCollection.map((item) => parseInteger(item));

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const dataLength = parseInteger(inputLines[0]);
    const sourceNumbers = parseIntegerArray(inputLines[1].split(' '));

    const subsegmentMedians = Array.from({ length: dataLength }, (_, startIndex) =>
        Array.from({ length: dataLength - startIndex }, (_, subLengthOffset) => {
            const endIndex = startIndex + subLengthOffset;
            const currentSubarray = sourceNumbers.slice(startIndex, endIndex + 1);
            
            currentSubarray.sort((valA, valB) => valA - valB);
            
            const medianPosition = Math.floor(currentSubarray.length / 2);
            return currentSubarray[medianPosition];
        })
    ).flat();

    subsegmentMedians.sort((valA, valB) => valA - valB);
    const finalMedianPosition = Math.floor(dataLength * (dataLength + 1) / 4);
    console.log(subsegmentMedians[finalMedianPosition]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
