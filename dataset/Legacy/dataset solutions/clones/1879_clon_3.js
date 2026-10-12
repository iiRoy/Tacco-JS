function InputProcessor(inputString) {
    var instanceRef = this;
    instanceRef.currentIndex = 0;
    instanceRef.originalInputString = inputString;

    var _tokenizeInput = function(targetString) {
        var processingResult = [];
        var cleanedTarget = targetString.replace(/[\n \t]+/g, " ");
        var tokens = cleanedTarget.split(" ");
        for (var tokenIdx = 0, totalTokens = tokens.length; tokenIdx < totalTokens; tokenIdx++) {
            processingResult.push(tokens[tokenIdx]);
        }
        return processingResult;
    };

    instanceRef.tokenizedStrings = _tokenizeInput(inputString);

    var _fetchNextRawToken = function() {
        if (instanceRef.currentIndex >= instanceRef.tokenizedStrings.length) {
            return null;
        }
        var currentToken = instanceRef.tokenizedStrings[instanceRef.currentIndex];
        instanceRef.currentIndex++;
        return currentToken;
    };

    instanceRef.getNextToken = function() {
        return _fetchNextRawToken();
    };

    instanceRef.getNextInteger = function() {
        var token = _fetchNextRawToken();
        return (token != null) ? parseInt(token, 10) : null;
    };

    instanceRef.getNextFloat = function() {
        var token = _fetchNextRawToken();
        return (token != null) ? parseFloat(token) : null;
    };

    instanceRef.getNextByteArray = function() {
        var token = _fetchNextRawToken();
        return (token != null) ? new Int8Array(token) : null;
    };
}

function ProcessSimulation(inputReader) {
    var numElements = inputReader.getNextInteger();
    var numSteps = inputReader.getNextInteger();
    var transitionMap = {};

    var _populateTransitionMap = function(count, reader, map) {
        for (var elementIdx = 0; elementIdx < count; elementIdx++) {
            map[elementIdx + 1] = reader.getNextInteger();
        }
    };
    _populateTransitionMap(numElements, inputReader, transitionMap);

    var currentPosition = 1;
    var visitedPositions = {};
    var simulationStepCounter = 0;

    var _detectCycle = function(startPosition, maxIterations, map, visitedTracker) {
        var position = startPosition;
        var stepCount = 0;
        for (; stepCount < maxIterations; stepCount++) {
            position = map[position];
            if (visitedTracker[position] !== undefined) {
                break;
            }
            visitedTracker[position] = stepCount;
        }
        return { finalPosition: position, stepsTaken: stepCount };
    };

    var cycleDetectionResult = _detectCycle(currentPosition, numElements, transitionMap, visitedPositions);
    currentPosition = cycleDetectionResult.finalPosition;
    simulationStepCounter = cycleDetectionResult.stepsTaken;

    if (simulationStepCounter < numElements) {
        var _calculateAdjustedSteps = function(initialSteps, cycleClosingPosition, visitedTrackerMap, totalStepsBeforeCycleBreak) {
            var cycleStartStepIndex = visitedTrackerMap[cycleClosingPosition];
            var cycleLength = totalStepsBeforeCycleBreak - cycleStartStepIndex;
            var stepsBeforeCycleEntry = cycleStartStepIndex - 1;
            var adjustedSteps = ((initialSteps - stepsBeforeCycleEntry) % cycleLength) + stepsBeforeCycleEntry;
            return adjustedSteps;
        };
        numSteps = _calculateAdjustedSteps(numSteps, currentPosition, visitedPositions, simulationStepCounter);
    }

    var finalResultPosition = 1;
    var _executeFinalSimulation = function(startingPoint, totalSteps, map) {
        var position = startingPoint;
        for (var s = 0; s < totalSteps; s++) {
            position = map[position];
        }
        return position;
    };
    finalResultPosition = _executeFinalSimulation(finalResultPosition, numSteps, transitionMap);

    console.log(finalResultPosition);
}

ProcessSimulation(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
