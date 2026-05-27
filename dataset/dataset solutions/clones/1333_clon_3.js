const parseNumbers = (stringArray) => stringArray.map(strNum => parseInt(strNum));

function processInput(rawData) {
    let inputLines = rawData.split("\n");

    let currentString = inputLines.shift();
    let operationCountString = inputLines.shift();
    let operationCount = parseInt(operationCountString);

    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        let currentCommandLine = inputLines[opIndex];
        let commandParts = currentCommandLine.split(" ");

        let commandType = commandParts[0];
        let rangeStartString = commandParts[1];
        let rangeEndString = commandParts[2];

        let indices = parseNumbers([rangeStartString, rangeEndString]);
        let startIndex = indices[0];
        let endIndex = indices[1];

        switch (commandType) {
            case "print": {
                let segmentToPrint = currentString.slice(startIndex, endIndex + 1);
                console.log(segmentToPrint);
                break;
            }
            case "replace": {
                let replacementText = commandParts[3];
                let prefixSegment = currentString.slice(0, startIndex);
                let suffixSegment = currentString.slice(endIndex + 1);
                currentString = prefixSegment + replacementText + suffixSegment;
                break;
            }
            case "reverse": {
                let segmentToModify = currentString.slice(startIndex, endIndex + 1);
                let reversedSegment = segmentToModify.split('').reverse().join('');

                let prefixSegment = currentString.slice(0, startIndex);
                let suffixSegment = currentString.slice(endIndex + 1);
                currentString = prefixSegment + reversedSegment + suffixSegment;
                break;
            }
        }
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
