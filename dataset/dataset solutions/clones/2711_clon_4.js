function makeSourceReader(textData) {
    const sourceLines = textData.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokens = [];
    let currentTokenPointer = 0;

    function advanceToNextTokenSet() {
        if (currentLinePointer < sourceLines.length) {
            // Mimics original's `split(" ").reverse()` and `pop()` behavior
            currentLineTokens = sourceLines[currentLinePointer].split(' ').reverse();
            currentTokenPointer = 0;
            currentLinePointer++;
        } else {
            currentLineTokens = [];
            currentTokenPointer = 0;
        }
    }

    function retrieveNextScalar(asString = false) {
        if (currentTokenPointer >= currentLineTokens.length) {
            advanceToNextTokenSet();
            if (currentTokenPointer >= currentLineTokens.length) {
                return undefined;
            }
        }
        const item = currentLineTokens[currentTokenPointer];
        currentTokenPointer++;
        return asString ? item : Number(item);
    }

    return {
        acquireNumeric: () => retrieveNextScalar(false),
        acquireText: () => retrieveNextScalar(true)
    };
}

const displacementMetric = (pX, pY, qX, qY) => Math.abs(pX - qX) + Math.abs(pY - qY);

const computePathSegment = (currentX, currentY, targetX, targetY, strideMagnitude) => {
    let remainingStride = strideMagnitude;
    let nextX = currentX;
    let nextY = currentY;

    const deltaX = targetX - nextX;
    const absoluteDeltaX = Math.abs(deltaX);

    // Prioritize X-axis movement
    if (absoluteDeltaX > 0) {
        const xMoveAmount = Math.min(remainingStride, absoluteDeltaX);
        nextX += (deltaX > 0 ? xMoveAmount : -xMoveAmount);
        remainingStride -= xMoveAmount;
    }

    // Use remaining stride for Y-axis movement
    // The original logic uses the full remaining stride, potentially overshooting Y
    if (remainingStride > 0) {
        if (targetY > nextY) {
            nextY += remainingStride;
        } else {
            nextY -= remainingStride;
        }
    }

    return { x: nextX, y: nextY };
};

function navigatePath(inputProcessor) {
    const _strideMagnitude = inputProcessor.acquireNumeric();
    const _destinationX = inputProcessor.acquireNumeric();
    const _destinationY = inputProcessor.acquireNumeric();

    if (_destinationX === 0 && _destinationY === 0) return "0";
    if (_strideMagnitude % 2 === 0 && (_destinationX + _destinationY) % 2 !== 0) return "-1";

    let _currentPosX = 0;
    let _currentPosY = 0;
    const _journeyLog = [];

    let initialDisplacement = displacementMetric(_currentPosX, _currentPosY, _destinationX, _destinationY);

    // First move adjustment logic
    if (initialDisplacement % _strideMagnitude !== 0) {
        if (initialDisplacement % _strideMagnitude % 2 === 1) {
            const firstStepResult = computePathSegment(_currentPosX, _currentPosY, _destinationX, _destinationY, _strideMagnitude);
            _currentPosX = firstStepResult.x;
            _currentPosY = firstStepResult.y;
            _journeyLog.push(`${_currentPosX} ${_currentPosY}`);
        }

        let adjustedDisplacement = displacementMetric(_currentPosX, _currentPosY, _destinationX, _destinationY);
        let partialStrideAmount = (adjustedDisplacement % _strideMagnitude) / 2;

        if (_strideMagnitude % 2 === 0 && Math.abs(_currentPosX - _destinationX) === Math.abs(_currentPosY - _destinationY)) {
             partialStrideAmount = _strideMagnitude - partialStrideAmount;
        }

        const absDifferenceX = Math.abs(_currentPosX - _destinationX);
        const absDifferenceY = Math.abs(_currentPosY - _destinationY);

        let tempX = _currentPosX;
        let tempY = _currentPosY;
        const complementaryStride = _strideMagnitude - partialStrideAmount;

        if (absDifferenceX >= partialStrideAmount) {
            if (tempX < _destinationX) {
                tempX += partialStrideAmount;
            } else {
                tempX -= partialStrideAmount;
            }
            if (tempY < _destinationY) {
                tempY -= complementaryStride;
            } else {
                tempY += complementaryStride;
            }
        } else {
            if (tempY < _destinationY) {
                tempY += partialStrideAmount;
            } else {
                tempY -= partialStrideAmount;
            }
            if (tempX < _destinationX) {
                tempX -= complementaryStride;
            } else {
                tempX += complementaryStride;
            }
        }
        _currentPosX = tempX;
        _currentPosY = tempY;
        _journeyLog.push(`${_currentPosX} ${_currentPosY}`);
    }

    // Main loop for subsequent moves until destination is reached
    while (displacementMetric(_currentPosX, _currentPosY, _destinationX, _destinationY) > 0) {
        const nextPosition = computePathSegment(_currentPosX, _currentPosY, _destinationX, _destinationY, _strideMagnitude);
        _currentPosX = nextPosition.x;
        _currentPosY = nextPosition.y;
        _journeyLog.push(`${_currentPosX} ${_currentPosY}`);
    }

    console.log(_journeyLog.length);
    return _journeyLog.join("\n");
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputDataProcessor = makeSourceReader(rawInputContent);

console.log(navigatePath(inputDataProcessor));