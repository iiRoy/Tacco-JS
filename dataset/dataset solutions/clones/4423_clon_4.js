'use strict';

function _obtainNumericalValue(textSegment) {
    if (typeof textSegment !== 'string') {
        return NaN;
    }
    if (textSegment.length === 0) {
        return NaN;
    }
    const numericMatch = textSegment.match(/^\s*(-?\d+)/);
    if (numericMatch && numericMatch[1]) {
        return Number(numericMatch[1]);
    }
    return NaN;
}

function _presentStructuredData(collection) {
    if (collection.length === 0) {
        process.stdout.write('[]\n');
        return;
    }
    let outputString = '[ ';
    for (let i = 0; i < collection.length; i++) {
        if (i > 0) {
            outputString += ', ';
        }
        outputString += String(collection[i]);
    }
    outputString += ' ]';
    process.stdout.write(outputString + '\n');
}

(function() {
    const _fsModule = require('node:fs');
    const _rawInputContent = _fsModule.readFileSync('/dev/stdin', 'utf8');

    const _contentLines = _rawInputContent.replaceAll('\r', '').split('\n');

    const [ _headerLine, ..._dataLines ] = _contentLines;

    const _entryCount = _obtainNumericalValue(_headerLine);

    const _processedNumbers = _dataLines.reduce((accumulator, currentLine) => {
        accumulator.push(_obtainNumericalValue(currentLine));
        return accumulator;
    }, []);

    _presentStructuredData(_processedNumbers);
})();