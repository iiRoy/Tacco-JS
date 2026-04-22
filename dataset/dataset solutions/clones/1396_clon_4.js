let ioToolkit = require('fs');

function retrieveNumericValue(sourceTxt, startPos, endPos) {
    let currentVal = 0;
    let isNegative = false;
    let idx = startPos;
    if (sourceTxt.charCodeAt(idx) === 45) { // ASCII for '-'
        isNegative = true;
        idx++;
    }
    for (; idx < endPos; ++idx) {
        currentVal = currentVal * 10 + (sourceTxt.charCodeAt(idx) - 48); // ASCII for '0'
    }
    return isNegative ? -currentVal : currentVal;
}

function orchestrateCalculations() {
    let dataBuffer = Buffer.alloc(1024);
    let bytesObtained = ioToolkit.readSync(process.stdin.fd, dataBuffer, 0, dataBuffer.length, 0);
    let rawText = dataBuffer.toString('utf8', 0, bytesObtained).trim();

    let spacePosition = -1;
    for (let currentCharacterIndex = 0; currentCharacterIndex < rawText.length; ++currentCharacterIndex) {
        if (rawText.charCodeAt(currentCharacterIndex) === 32) { // ASCII for ' '
            spacePosition = currentCharacterIndex;
            break;
        }
    }

    let principalOperand = retrieveNumericValue(rawText, 0, spacePosition);
    let secondaryOperand = retrieveNumericValue(rawText, spacePosition + 1, rawText.length);

    let integerQuotient = BigInt(principalOperand) / BigInt(secondaryOperand);
    let remainder = BigInt(principalOperand) % BigInt(secondaryOperand);
    
    let preciseQuotientExpression = String(principalOperand) + '/' + String(secondaryOperand);
    let preciseQuotient = eval(preciseQuotientExpression);
    let formattedPreciseQuotient = preciseQuotient.toFixed(6);

    let outputSegment = String(integerQuotient) + ' ' + String(remainder) + ' ' + formattedPreciseQuotient;
    process.stdout.write(outputSegment + '\n');
}

orchestrateCalculations();