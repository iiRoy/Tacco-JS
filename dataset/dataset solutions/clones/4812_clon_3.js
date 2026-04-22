let rawInputBuffer = "";
let parsedInputLines = [];
let currentLineIndex = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    rawInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    parsedInputLines = rawInputBuffer.split('\n');
    executeCoreLogic();
});

function retrieveNextLine() {
    if (currentLineIndex >= parsedInputLines.length) {
        console.error("End of input reached unexpectedly.");
        return "";
    }
    return parsedInputLines[currentLineIndex++];
}

function calculatePowerOfTwo(exponent) {
    if (exponent < 0) {
        return 0; // Negative exponents usually not expected for this problem type
    }
    // Using bit shift for efficient calculation of 2^exponent
    return 1 << exponent;
}

function executeCoreLogic() {
    const elementCountString = retrieveNextLine();
    if (!elementCountString || elementCountString.trim() === "") {
        console.log("0");
        return;
    }
    const totalElements = parseInt(elementCountString);

    if (isNaN(totalElements) || totalElements < 0) {
        console.log("0");
        return;
    }
    
    if (totalElements === 0) {
        console.log("1"); 
        return;
    }

    const rawNumberSequence = retrieveNextLine();
    if (!rawNumberSequence || rawNumberSequence.trim() === "") {
        console.log("0");
        return;
    }
    const numberTokens = rawNumberSequence.split(" ");

    if (numberTokens.length !== totalElements) {
        console.log("0");
        return;
    }

    const inputValues = numberTokens.map(Number);

    const frequencyCounts = new Array(totalElements).fill(2);
    frequencyCounts[0] = 1;

    for (let k = 0; k < totalElements; ++k) {
        const value = inputValues[k];
        
        if (isNaN(value) || value < 0 || value >= totalElements) {
            console.log("0");
            return;
        }
        frequencyCounts[value]--;
    }

    const initialCheckIndex = (totalElements % 2 === 1) ? 0 : 1;
    let configurationIsValid = true;

    for (let currentIdx = initialCheckIndex; currentIdx < totalElements; currentIdx += 2) {
        if (frequencyCounts[currentIdx] !== 0) {
            configurationIsValid = false;
            break;
        }
    }

    if (!configurationIsValid) {
        console.log("0");
        return;
    }

    const exponentForResult = Math.floor(totalElements / 2);
    const finalResult = calculatePowerOfTwo(exponentForResult);

    console.log(finalResult.toString());
}