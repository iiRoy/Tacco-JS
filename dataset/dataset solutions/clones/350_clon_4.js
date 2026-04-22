let sourceContentCollection = '';
function executeSolver() {
    const statementList = sourceContentCollection.split('\n');
    function processNextStatement(statementsToProcess, currentIndex) {
        if (currentIndex >= statementsToProcess.length) {
            return;
        }
        const currentStatement = statementsToProcess[currentIndex];
        performStatementAnalysis(currentStatement);
        processNextStatement(statementsToProcess, currentIndex + 1);
    }
    processNextStatement(statementList, 0);
}
function performStatementAnalysis(currentStatement) {
    const cleanSegment = currentStatement.trim();
    if (cleanSegment === '') return;
    const plusSymbolPosition = cleanSegment.indexOf('+');
    const equalsSymbolPosition = cleanSegment.indexOf('=');
    const firstTermString = cleanSegment.substring(0, plusSymbolPosition);
    const secondTermString = cleanSegment.substring(plusSymbolPosition + 1, equalsSymbolPosition);
    const resultTermString = cleanSegment.substring(equalsSymbolPosition + 1);
    const foundDigitValue = determineValidReplacement(firstTermString, secondTermString, resultTermString, 0);
    displayFinalResult(foundDigitValue === 10 ? 'NA' : foundDigitValue);
}
function transformExpressionPart(expressionText, digitToReplace) {
    let transformedText = '';
    for (let charIndex = 0; charIndex < expressionText.length; charIndex++) {
        transformedText += (expressionText[charIndex] === 'X' ? String(digitToReplace) : expressionText[charIndex]);
    }
    return transformedText;
}
function checkLeadingZeroValidity(originalPart, replacementDigit) {
    if (originalPart === 'X') {
        return true;
    }
    if (originalPart.charAt(0) === 'X' && replacementDigit === 0) {
        return false;
    }
    return true;
}
function determineValidReplacement(term1, term2, term3, currentTestDigit) {
    if (currentTestDigit > 9) {
        return 10;
    }
    const processedTerm1 = transformExpressionPart(term1, currentTestDigit);
    const processedTerm2 = transformExpressionPart(term2, currentTestDigit);
    const processedTerm3 = transformExpressionPart(term3, currentTestDigit);
    if (!checkLeadingZeroValidity(term1, currentTestDigit) ||
        !checkLeadingZeroValidity(term2, currentTestDigit) ||
        !checkLeadingZeroValidity(term3, currentTestDigit)) {
        return determineValidReplacement(term1, term2, term3, currentTestDigit + 1);
    }
    const numericalVal1 = +processedTerm1;
    const numericalVal2 = +processedTerm2;
    const numericalVal3 = +processedTerm3;
    if (numericalVal1 + numericalVal2 === numericalVal3) {
        return currentTestDigit;
    } else {
        return determineValidReplacement(term1, term2, term3, currentTestDigit + 1);
    }
}
function displayFinalResult(outputValue) {
    process.stdout.write(outputValue + '\n');
}
function retrieveSourceData() {
    return new Promise(resolver => {
        let accumulatedData = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', dataChunk => {
            accumulatedData += dataChunk;
        });
        process.stdin.on('end', () => {
            resolver(accumulatedData);
        });
    });
}
retrieveSourceData().then(rawData => {
    sourceContentCollection = rawData;
    executeSolver();
});