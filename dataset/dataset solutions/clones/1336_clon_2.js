'use strict';
(function (inputContent) {
    var inputLines = inputContent.toString().split('\n');

    var OperationHandler = function (initialString) {
        this.currentString = initialString;
        this.outputBuffer = [];
    };

    OperationHandler.prototype.executeOperation = function (opName, rangeIndices, extraValue) {
        var instanceRef = this;

        var availableOperations = {
            displaySubstring: function (rangeIndices) {
                instanceRef.outputBuffer.push(instanceRef.currentString.slice(rangeIndices[0], rangeIndices[1] + 1));
            },
            flipSubstring: function (rangeIndices) {
                var characterArray = instanceRef.currentString.split('');
                var flippedSegment = characterArray.slice(rangeIndices[0], rangeIndices[1] + 1).reverse().join('');
                this.substituteSegment(rangeIndices, flippedSegment);
            },
            substituteSegment: function (rangeIndices, extraValue) {
                var characterArray = instanceRef.currentString.split('');
                characterArray.splice(rangeIndices[0], rangeIndices[1] - rangeIndices[0] + 1, extraValue);
                instanceRef.currentString = characterArray.join('');
            }
        };
        availableOperations[opName](rangeIndices, extraValue);
    };

    OperationHandler.prototype.getOutputString = function () {
        return this.outputBuffer.join('\n');
    };

    var finalResult = (function (initialSource, operationList) {
        var handlerInstance = new OperationHandler(initialSource);
        operationList.forEach(function (currentOpDetails) {
            handlerInstance.executeOperation(currentOpDetails[0], currentOpDetails.slice(1, 3).map(Number), currentOpDetails[3]);
        });
        return handlerInstance.getOutputString();
    }(
        inputLines.shift(),
        inputLines.slice(0, inputLines.shift()).map(function (currentOpDetails) {
            return currentOpDetails.split(' ');
        })
    ));

    console.log(finalResult);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));