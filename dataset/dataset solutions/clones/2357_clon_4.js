const _ioSystem = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let _collectedInputLines = [];
let _currentLineIndex = 0;

_ioSystem.on('line', (inputLine) => {
    _collectedInputLines.push(inputLine);
});

_ioSystem.on('close', () => {
    console.error('\n↑入力 ↓出力');
    _processProgramLogic();
});

const _retrieveNextInputDatum = () => _collectedInputLines[_currentLineIndex++];
const _transformLineToNumericSequence = (textualLine) => textualLine.split(' ').map(Number);
const _presentFinalResult = (outcomeValue) => console.log(outcomeValue);

const _processProgramLogic = () => {
    const _gridDimensionsSpec = _retrieveNextInputDatum();
    const [_rowsCount, _columnsCount] = _transformLineToNumericSequence(_gridDimensionsSpec);

    const _firstGridValues = Array.from({ length: _rowsCount }, _retrieveNextInputDatum)
                                 .map(_transformLineToNumericSequence);

    const _secondGridValues = Array.from({ length: _rowsCount }, _retrieveNextInputDatum)
                                  .map(_transformLineToNumericSequence);

    const _elementwiseDifferenceMatrix = _firstGridValues.map((rowElementsA, rowIndex) =>
        rowElementsA.map((valA, colIndex) => Math.abs(valA - _secondGridValues[rowIndex][colIndex]))
    );

    const _computedPathMagnitudeSets = Array.from({ length: _rowsCount }, () =>
        Array.from({ length: _columnsCount }, () => null)
    );

    const _determineAccessibleMagnitudes = (rowIdx, colIdx) => {
        if (_computedPathMagnitudeSets[rowIdx][colIdx] !== null) {
            return _computedPathMagnitudeSets[rowIdx][colIdx];
        }

        const _currentCellAbsoluteDifference = _elementwiseDifferenceMatrix[rowIdx][colIdx];
        let _accumulatedMagnitudes = new Set();

        if (rowIdx === 0 && colIdx === 0) {
            _accumulatedMagnitudes.add(_currentCellAbsoluteDifference);
        } else {
            if (rowIdx > 0) {
                const _magnitudesFromUpperCell = _determineAccessibleMagnitudes(rowIdx - 1, colIdx);
                for (const _previousPathMagnitude of _magnitudesFromUpperCell) {
                    _accumulatedMagnitudes.add(Math.abs(_previousPathMagnitude + _currentCellAbsoluteDifference));
                    _accumulatedMagnitudes.add(Math.abs(_previousPathMagnitude - _currentCellAbsoluteDifference));
                }
            }
            if (colIdx > 0) {
                const _magnitudesFromLeftCell = _determineAccessibleMagnitudes(rowIdx, colIdx - 1);
                for (const _previousPathMagnitude of _magnitudesFromLeftCell) {
                    _accumulatedMagnitudes.add(Math.abs(_previousPathMagnitude + _currentCellAbsoluteDifference));
                    _accumulatedMagnitudes.add(Math.abs(_previousPathMagnitude - _currentCellAbsoluteDifference));
                }
            }
        }
        _computedPathMagnitudeSets[rowIdx][colIdx] = _accumulatedMagnitudes;
        return _accumulatedMagnitudes;
    };

    const _finalCellReachableMagnitudes = _determineAccessibleMagnitudes(_rowsCount - 1, _columnsCount - 1);
    const _smallestFinalMagnitude = Math.min(...Array.from(_finalCellReachableMagnitudes));

    _presentFinalResult(_smallestFinalMagnitude);
};