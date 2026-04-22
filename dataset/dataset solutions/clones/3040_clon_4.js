const fileSystemInterface = require('fs');

function processInputAndCompute(inputData) {
    const contentLines = inputData.trim().split('\n');

    if (contentLines.length < 2) {
        throw new Error("Insufficient input lines provided. Expected at least two lines.");
    }

    const dataSequence = contentLines[1]; 

    let currentScanPoint = 0;
    let accumulatedValue = 0;
    const keyPattern = "#.";

    while (true) {
        const patternOccurrence = dataSequence.indexOf(keyPattern, currentScanPoint);

        if (patternOccurrence === -1) {
            break; 
        }

        const nextPatternCheck = dataSequence.indexOf(keyPattern, patternOccurrence + 2);

        if (nextPatternCheck !== -1) {
            let dotCounter = 0;
            for (let charIndex = patternOccurrence + 1; charIndex < dataSequence.length; charIndex++) {
                if (dataSequence[charIndex] === '.') {
                    dotCounter++;
                }
            }
            accumulatedValue += dotCounter;
            break; 
        } else {
            accumulatedValue += 1;
            currentScanPoint = patternOccurrence + 1;
        }
    }

    return accumulatedValue.toString(); 
}

function launchProcessor() {
    try {
        const fileContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
        const computedResult = processInputAndCompute(fileContent);
        console.log(computedResult);
    } catch (processingError) {
        throw processingError;
    }
}

launchProcessor();