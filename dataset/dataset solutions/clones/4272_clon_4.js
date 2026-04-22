function processData(dataStream) {
    let firstBreak = dataStream.indexOf('\n');
    let firstNumericalSegment = dataStream.substring(0, firstBreak);
    let initialFigure = Number(firstNumericalSegment);

    let subsequentContentStart = firstBreak + 1;
    let secondBreak = dataStream.indexOf('\n', subsequentContentStart);
    let secondNumericalSegment;

    if (secondBreak !== -1) {
        secondNumericalSegment = dataStream.substring(subsequentContentStart, secondBreak);
    } else {
        secondNumericalSegment = dataStream.substring(subsequentContentStart);
    }
    
    let secondaryFigure = Number(secondNumericalSegment);

    let finalCalculation = (2 * secondaryFigure) - initialFigure;
    console.log(finalCalculation);
}

const acquiredContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processData(acquiredContent);