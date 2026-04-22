const processGridData = (dataPayload) => {
    const searchTarget = "snuke";
    const gridLines = dataPayload.trim().split('\n');

    const [hVal, wVal] = gridLines[0].split(' ').map(Number); // hVal corresponds to original H

    const discoveredLocations = gridLines.slice(1, hVal + 1).flatMap((currentLine, lineIdx) => {
        const rowNumber = lineIdx + 1; 
        const currentLineElements = currentLine.split(' ');

        return currentLineElements.map((element, elementIdx) => {
            const columnNumber = elementIdx + 1; 
            if (element === searchTarget) {
                const columnChar = String.fromCharCode(64 + columnNumber); // A=1, B=2, ...
                return `${columnChar}${rowNumber}`;
            }
            return ''; 
        }).filter(Boolean); 
    });

    const finalResultSequence = discoveredLocations.join('');

    console.log(finalResultSequence);
};

const acquireSourceText = require("fs").readFileSync;
const inputSourcePath = "/dev/stdin";
processGridData(acquireSourceText(inputSourcePath, "utf8"));