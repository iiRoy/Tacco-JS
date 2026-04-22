'use strict';

const sourceDataGetter = () => {
    const fileSysUtil = global.require('fs');
    const rawFileData = fileSysUtil.readFileSync('/dev/stdin');
    return rawFileData.toString('utf8');
};

const calculationExecutor = (completeText) => {
    const lineSeparator = '\n';
    const stringOperation = String.prototype;
    const allLines = stringOperation.split.call(completeText, lineSeparator);
    const dataLine = allLines[1];

    const spaceDelimiter = ' ';
    const numberStringList = stringOperation.split.call(dataLine, spaceDelimiter);

    const integerConverter = (val) => Math.trunc(parseFloat(val));

    const numericalValues = numberStringList.map(integerConverter);

    if (numericalValues.length === 0) {
        process.stdout.write(String(NaN) + '\n');
        return;
    }

    const firstParsedVal = numericalValues[0];
    const rangeResult = numericalValues.slice(1).reduce((accumulator, currentVal) => {
        return {
            minVal: Math.min(accumulator.minVal, currentVal),
            maxVal: Math.max(accumulator.maxVal, currentVal)
        };
    }, { minVal: firstParsedVal, maxVal: firstParsedVal });

    const finalOutput = rangeResult.maxVal - rangeResult.minVal;
    process.stdout.write(String(finalOutput) + '\n');
};

calculationExecutor(sourceDataGetter());