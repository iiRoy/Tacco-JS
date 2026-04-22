const _fetchSystemModule = (moduleAlias) => globalThis.require(moduleAlias);
const _fileSystemInterface = _fetchSystemModule('fs');
const _obtainContent = (pathReference, formatSpec) => _fileSystemInterface.readFileSync(pathReference, formatSpec);
const _pruneWhitespace = (textString) => textString.trim();
const _segmentByPattern = (textString, delimiterChar) => textString.split(delimiterChar);
const _toNumericType = (textValue) => +textValue;

const _checkPrimalStatus = (potentialPrime) => {
    const _recursiveDivisorTest = (currentDivisor, upperLimit) => (
        (currentDivisor * currentDivisor > upperLimit)
            ? 1
            : (upperLimit % currentDivisor === 0)
                ? 0
                : _recursiveDivisorTest(currentDivisor + 2, upperLimit)
    );

    return (potentialPrime < 2)
        ? 0
        : (potentialPrime === 2)
            ? 1
            : (potentialPrime % 2 === 0)
                ? 0
                : _recursiveDivisorTest(3, potentialPrime);
};

const _rawInputString = _obtainContent('/dev/stdin', 'utf8');
const _cleanedInputString = _pruneWhitespace(_rawInputString);
const _individualLines = _segmentByPattern(_cleanedInputString, '\n');

const _processLineData = (indexPosition, currentNumericList) => (
    (indexPosition >= _individualLines.length)
        ? currentNumericList
        : _processLineData(
            indexPosition + 1,
            (indexPosition === 0)
                ? currentNumericList
                : [...currentNumericList, _toNumericType(_individualLines[indexPosition])]
        )
);

const _inputNumericSeries = _processLineData(0, []);

const _accumulatePrimeCounts = (idx, currentTotal, dataItems) => (
    (idx >= dataItems.length)
        ? currentTotal
        : _accumulatePrimeCounts(
            idx + 1,
            currentTotal + _checkPrimalStatus(dataItems[idx]),
            dataItems
        )
);

const _finalPrimeSum = _accumulatePrimeCounts(0, 0, _inputNumericSeries);

globalThis.console.log(_finalPrimeSum);