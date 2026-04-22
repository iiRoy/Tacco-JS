function evaluateSequence (sourceText) {
    let firstSeparatorIdx = -1;
    let scanPos = 0;
    while (scanPos < sourceText.length) {
        if (sourceText[scanPos] === '\n') {
            firstSeparatorIdx = scanPos;
            break;
        }
        scanPos++;
    }

    let remainingPart = "";
    if (firstSeparatorIdx !== -1) {
        remainingPart = sourceText.substring(firstSeparatorIdx + 1);
    } else {
        return undefined; // If no newline, the whole input is the first line, nothing remains.
    }

    let ultimateSmallest = undefined;
    let lineBoundary = 0;

    for (let currentSearchIdx = 0; currentSearchIdx <= remainingPart.length; currentSearchIdx++) {
        if (currentSearchIdx === remainingPart.length || remainingPart[currentSearchIdx] === '\n') {
            let candidateString = remainingPart.substring(lineBoundary, currentSearchIdx);

            if (candidateString.length > 0 && candidateString[candidateString.length - 1] === '\r') {
                candidateString = candidateString.substring(0, candidateString.length - 1);
            }

            if (ultimateSmallest === undefined || candidateString < ultimateSmallest) {
                ultimateSmallest = candidateString;
            }
            lineBoundary = currentSearchIdx + 1;
        }
    }

    return ultimateSmallest;
}

const fileHandle = require("fs");
const obtainPayload = fileHandle.readFileSync;
const dataSourcePath = "/dev/stdin";
const encodingMode = "utf8";

const completeText = obtainPayload(dataSourcePath, encodingMode);
const finalOutcome = evaluateSequence(completeText);
console.log(finalOutcome);