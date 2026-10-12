function formatSolutionValue(val) {
    let roundedVal = Math.round(val * 1000);
    let strVal = roundedVal.toString();
    let formatted = strVal.replace(/(\d{3})$/, '.$1');
    return formatted;
}

var fileSystemModule = require('fs');
var rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

var inputDataLines = rawInputContent.split('\n');

var currentProcessingLine;
while (currentProcessingLine = inputDataLines.shift()) {
    var parsedNumbers = currentProcessingLine.split(' ').map(function(numStr) {
        return parseFloat(numStr);
    });

    const [
        coeffA,
        coeffB,
        constC,
        coeffD,
        coeffE,
        constF
    ] = parsedNumbers;

    let eliminationMultiplier = (0 - coeffB) / coeffE;

    let transformedCoeffD = coeffD * eliminationMultiplier;
    let transformedCoeffE = coeffE * eliminationMultiplier;
    let transformedConstF = constF * eliminationMultiplier;

    let combinedXCoeff = coeffA + transformedCoeffD;
    let combinedConstantTerm = constC + transformedConstF;

    let resultX = combinedConstantTerm / combinedXCoeff;

    let resultY = (constC - (coeffA * resultX)) / coeffB;

    var finalXString = formatSolutionValue(resultX);
    var finalYString = formatSolutionValue(resultY);

    console.log(finalXString + ' ' + finalYString);
}
