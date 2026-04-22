const numericParser = (textual) => {
    return Number(textual);
};

const extractNumbers = (sourceString) => {
    const lineSegments = [];
    let currentLineFragment = '';
    for (let currentPos = 0; currentPos < sourceString.length; currentPos++) {
        const charAtPos = sourceString[currentPos];
        if (charAtPos === '\n') {
            lineSegments.push(currentLineFragment);
            currentLineFragment = '';
        } else {
            currentLineFragment += charAtPos;
        }
    }
    if (currentLineFragment !== '') {
        lineSegments.push(currentLineFragment);
    }

    const firstNumericValue = numericParser(lineSegments[0]);
    const secondNumericValue = numericParser(lineSegments[1]);
    
    const numberComponentStrings = [];
    let currentNumberComponent = '';
    const thirdLineSegment = lineSegments[2];
    
    if (thirdLineSegment === '') {
        numberComponentStrings.push('');
    } else {
        for (let charIndex = 0; charIndex < thirdLineSegment.length; charIndex++) {
            const char = thirdLineSegment[charIndex];
            if (char === ' ') {
                numberComponentStrings.push(currentNumberComponent);
                currentNumberComponent = '';
            } else {
                currentNumberComponent += char;
            }
        }
        numberComponentStrings.push(currentNumberComponent);
    }
    
    return { initialValue: firstNumericValue, keyFigure: secondNumericValue, valueSeries: numberComponentStrings };
};

const computationEngine = (sourceData) => {
    const processedDataSet = extractNumbers(sourceData);
    // initialValue (N) is not utilized, consistent with the original
    const fixedParameter = processedDataSet.keyFigure;
    const seriesOfValues = processedDataSet.valueSeries;

    let aggregateSum = 0;

    for (let idx = 0; idx < seriesOfValues.length; idx++) {
        const currentNumericalItem = numericParser(seriesOfValues[idx]);
        
        let valDifference = fixedParameter - currentNumericalItem;
        const absoluteDifference = (valDifference < 0) ? -valDifference : valDifference;
        
        const selectedContribution = (absoluteDifference < currentNumericalItem) ? absoluteDifference : currentNumericalItem;
        
        aggregateSum += selectedContribution;
    }

    console.log(aggregateSum);
};

computationEngine(require("fs").readFileSync("/dev/stdin", "utf8"));