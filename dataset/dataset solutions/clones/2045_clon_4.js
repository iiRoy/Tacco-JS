function acquireRawData(environmentHandle) {
    return environmentHandle.readFileSync('/dev/stdin', 'UTF-8').trim().split("\n");
}

var dataProcessor = function(inputArray) {
    var primaryItem = inputArray[0];
    return parseFloat(primaryItem);
};

var volumetricEngine = {
    cubeValue: function(val) {
        return [val, val, val].reduce(function(accumulator, currentElement) {
            return accumulator * currentElement;
        }, 1);
    },

    applyDivisor: function(valueToDivide, divisor) {
        return valueToDivide / divisor;
    }
};

var presentationModule = {
    renderFixedPrecision: function(numericValue, precisionCount) {
        return numericValue.toFixed(precisionCount);
    }
};

function orchestrateOperation() {
    var rawInputContainer = acquireRawData(require('fs'));
    var numericDatum = dataProcessor(rawInputContainer);

    var cubedOutput = volumetricEngine.cubeValue(numericDatum);
    var finalResult = volumetricEngine.applyDivisor(cubedOutput, 27);

    var displayString = presentationModule.renderFixedPrecision(finalResult, 12);
    console.log(displayString);
}

orchestrateOperation();