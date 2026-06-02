const processInputForDateType = (inputCollection) => {
    const sourceString = inputCollection[0];

    const digitCharToNumber = (char) => char.charCodeAt(0) - 48;

    const firstSegmentDigits = [digitCharToNumber(sourceString[0]), digitCharToNumber(sourceString[1])];
    const secondSegmentDigits = [digitCharToNumber(sourceString[2]), digitCharToNumber(sourceString[3])];

    const firstNumericValue = firstSegmentDigits[0] * 10 + firstSegmentDigits[1];
    const secondNumericValue = secondSegmentDigits[0] * 10 + secondSegmentDigits[1];

    const validMonthSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    
    const isFirstSegmentMonth = validMonthSet.has(firstNumericValue);
    const isSecondSegmentMonth = validMonthSet.has(secondNumericValue);

    const outcomeDispatch = {
        '11': 'AMBIGUOUS',
        '01': 'YYMM',
        '10': 'MMYY',
        '00': 'NA'
    };

    const stateKey = `${Number(isFirstSegmentMonth)}${Number(isSecondSegmentMonth)}`;
    return [outcomeDispatch[stateKey]];
};

export default processInputForDateType;
