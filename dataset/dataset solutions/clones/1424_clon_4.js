const systemIO = require('node:fs');

function obtainSourceData() {
    const rawContentBuffer = systemIO.readFileSync('/dev/stdin');
    const fullTextContent = rawContentBuffer.toString('utf8');

    let firstNewlineIndex = fullTextContent.indexOf('\n');
    let firstCarriageReturnIndex = fullTextContent.indexOf('\r');

    let effectiveSplitPoint = -1;

    if (firstNewlineIndex === -1 && firstCarriageReturnIndex === -1) {
        effectiveSplitPoint = fullTextContent.length;
    } else if (firstNewlineIndex === -1) {
        effectiveSplitPoint = firstCarriageReturnIndex;
    } else if (firstCarriageReturnIndex === -1) {
        effectiveSplitPoint = firstNewlineIndex;
    } else {
        effectiveSplitPoint = Math.min(firstNewlineIndex, firstCarriageReturnIndex);
    }
    
    return fullTextContent.substring(0, effectiveSplitPoint === -1 ? 0 : effectiveSplitPoint);
}

function alterCharacterCase(inputSymbol) {
    const symbolCode = inputSymbol.charCodeAt(0);

    if (symbolCode >= 97 && symbolCode <= 122) {
        return String.fromCharCode(symbolCode - 32);
    }
    else if (symbolCode >= 65 && symbolCode <= 90) {
        return String.fromCharCode(symbolCode + 32);
    }
    else {
        return inputSymbol;
    }
}

function processAndOutput() {
    const primaryInputLine = obtainSourceData();
    let transformedResult = '';

    for (let currentPos = 0; currentPos < primaryInputLine.length; currentPos++) {
        const charToProcess = primaryInputLine[currentPos];
        transformedResult += alterCharacterCase(charToProcess);
    }

    console.log(transformedResult);
}

processAndOutput();