function InputProcessor(sourceData) {
    let instanceRef = this;
    instanceRef.currentIdx = 0;
    instanceRef.originalText = sourceData;
    instanceRef.tokenizedStrings = (function(processingTarget) {
        const processedTokens = [];
        let cleanedInput = processingTarget.replace(/[\n \t]+/g, " ");
        const splitParts = cleanedInput.split(" ");
        for (let idx = 0, totalLength = splitParts.length; idx < totalLength; idx++) {
            processedTokens.push(splitParts[idx]);
        }
        return processedTokens;
    }(sourceData));

    instanceRef.getNextToken = function() {
        const tokenResult = instanceRef.tokenizedStrings[instanceRef.currentIdx];
        instanceRef.currentIdx++;
        return (tokenResult !== null) ? tokenResult : null;
    };

    instanceRef.getNextInteger = function() {
        const integerResult = instanceRef.tokenizedStrings[instanceRef.currentIdx];
        instanceRef.currentIdx++;
        return (integerResult !== null) ? parseInt(integerResult, 10) : null;
    };

    instanceRef.getNextDecimal = function() {
        const decimalResult = instanceRef.tokenizedStrings[instanceRef.currentIdx];
        instanceRef.currentIdx++;
        return (decimalResult !== null) ? parseFloat(decimalResult) : null;
    };
    
    instanceRef.getNextByteValue = function() {
        const byteValueResult = instanceRef.tokenizedStrings[instanceRef.currentIdx];
        instanceRef.currentIdx++;
        return (byteValueResult !== null) ? new Int8Array(byteValueResult) : null;
    };
}

function ExecuteSolution(inputReader) {

    const countN = inputReader.getNextInteger();
    const limitM = inputReader.getNextInteger();
    const queryCount = inputReader.getNextInteger();
    
    const queryDetails = [];
    let maxScore = 0;
    let currentScore = 0;
    
    for (let loopIdx = 0; loopIdx < queryCount; loopIdx++) {
        const detailEntry = {
                firstIndex: inputReader.getNextInteger(),
                secondIndex: inputReader.getNextInteger(),
                targetDifference: inputReader.getNextInteger(),
                scoreValue: inputReader.getNextInteger(),
        };
        queryDetails.push(detailEntry);
    }
    
    const numberSequence = [];
    for (let loopIdx = 0; loopIdx < countN; loopIdx++) {
        numberSequence.push(1);
    }
    
    let shouldTerminate = false;
    for (let iterationA = 0; iterationA < Math.pow(limitM, countN); iterationA++) {
        
        numberSequence[countN - 1]++;
        for (let iterationB = countN - 1; iterationB >= 0; iterationB--) {
            if (numberSequence[iterationB] > limitM) {
                if (iterationB === 0) {
                    shouldTerminate = true;
                    break;
                }
                numberSequence[iterationB - 1]++;
                const minimumValue = numberSequence[iterationB - 1];
                for (let iterationC = iterationB; iterationC < numberSequence.length; iterationC++) {
                    numberSequence[iterationC] = minimumValue;
                }
            }
        }
        if (shouldTerminate) break;
        
        currentScore = 0;
        for (let loopIdx = 0; loopIdx < queryDetails.length; loopIdx++) {
            if (queryDetails[loopIdx].targetDifference === numberSequence[queryDetails[loopIdx].secondIndex - 1] - numberSequence[queryDetails[loopIdx].firstIndex - 1]) {
                currentScore += queryDetails[loopIdx].scoreValue;
            }
        }
        if (maxScore < currentScore) maxScore = currentScore;
    }
    
    console.log(maxScore);
}
ExecuteSolution(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
