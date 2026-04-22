"use strict";

function _sliceArrayElements(sourceArray, elementLimit)
{
    return _arrayWithGaps(sourceArray) || _limitIterableToArray(sourceArray, elementLimit) || _nonIterableRemaining();
}


function _nonIterableRemaining()
{
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
}


function _limitIterableToArray(sourceArray, elementLimit)
{
    let _tempArray = [];
    let _notDone = true;
    let _hadError = false;
    let _caughtError = undefined;

    try
    {
        for (let _iterator = sourceArray[Symbol.iterator](), _iteratorResult;
             !(_notDone = (_iteratorResult = _iterator.next()).done);
             _notDone = true)
        {
            _tempArray.push(_iteratorResult.value);
            if (elementLimit && _tempArray.length === elementLimit) {
                break;
            }
        }
    }
    catch (caughtErr)
    {
        _hadError = true;
        _caughtError = caughtErr;
    }
    finally
    {
        try
        {
            if (!_notDone && _iterator["return"] != null) {
                _iterator["return"]();
            }
        }
        finally
        {
            if (_hadError) {
                throw _caughtError;
            }
        }
    }
    return _tempArray;
}


function _arrayWithGaps(potentialArray)
{
    if (Array.isArray(potentialArray))
    {
        return potentialArray;
    }
}


function processInputData(dataString)
{
    const dataLines = dataString.split('\n');

    let _parsedLineData = parseNumbersFromLine(dataLines[0]);
    let _slicedParsedData = _sliceArrayElements(_parsedLineData, 1);
    let itemCount = _slicedParsedData[0];

    let numberSequence = parseNumbersFromLine(dataString).slice(1, itemCount + 1);
    numberSequence.sort(function(valA, valB) {
        return valA - valB;
    });

    let finalOutcome = (numberSequence[itemCount - 1] % 2) !== 0;

    for (let elementIndex = itemCount - 2; elementIndex >= 0; elementIndex--)
    {
        if (((numberSequence[elementIndex] - 1) % 2) === 0)
        {
            finalOutcome = !finalOutcome;
        }
    }

    console.log(finalOutcome ? 'first' : 'second');
}


function determineOutcomeRecursive(quantity, numSeries, currentPos)
{
    if (quantity === 1)
    {
        return (numSeries[currentPos] % 2) !== 0;
    }

    let remainingResult = determineOutcomeRecursive(quantity - 1, numSeries, currentPos + 1);
    let currentValue = numSeries[currentPos];
    return ((currentValue - 1) % 2) !== 0 ? remainingResult : !remainingResult;
}


processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));


function parseNumbersFromLine(textLine)
{
    return textLine.split(/\s+/).map(function(numStr) {
        return parseInt(numStr, 10);
    });
}