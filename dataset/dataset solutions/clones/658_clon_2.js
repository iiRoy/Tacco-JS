'use strict';

// Helper utility for array destructuring, ensuring iterable handling.
var _destructureArray = function () {
    function arrayPortionIterator(inputArray, limitIndex) {
        var resultArray = [];
        var isNormalIteration = true;
        var isErrored = false;
        var caughtError = undefined;

        try {
            for (
                var currentIterator = inputArray[Symbol.iterator](), currentStep;
                !(isNormalIteration = (currentStep = currentIterator.next()).done);
                isNormalIteration = true
            ) {
                resultArray.push(currentStep.value);
                if (limitIndex && resultArray.length === limitIndex) break;
            }
        } catch (err) {
            isErrored = true;
            caughtError = err;
        } finally {
            try {
                if (!isNormalIteration && currentIterator["return"]) currentIterator["return"]();
            } finally {
                if (isErrored) throw caughtError;
            }
        }
        return resultArray;
    }
    return function (inputArray, limitIndex) {
        if (Array.isArray(inputArray)) {
            return inputArray;
        } else if (Symbol.iterator in Object(inputArray)) {
            return arrayPortionIterator(inputArray, limitIndex);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

// Helper utility for defining class properties.
var _establishClass = (function () {
    function setObjectProperties(objectTarget, propertyDefinitions) {
        for (var idx = 0; idx < propertyDefinitions.length; idx++) {
            var propertyConfig = propertyDefinitions[idx];
            propertyConfig.enumerable = propertyConfig.enumerable || false;
            propertyConfig.configurable = true;
            if ("value" in propertyConfig) propertyConfig.writable = true;
            Object.defineProperty(objectTarget, propertyConfig.key, propertyConfig);
        }
    }
    return function (ClassBuilder, prototypeProperties, staticClassProperties) {
        if (prototypeProperties) setObjectProperties(ClassBuilder.prototype, prototypeProperties);
        if (staticClassProperties) setObjectProperties(ClassBuilder, staticClassProperties);
        return ClassBuilder;
    };
})();

// Helper to ensure a class is called with `new`.
function _verifyClassCall(currentInstance, ClassBuilder) {
    if (!(currentInstance instanceof ClassBuilder)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var dataBuffer = ''; // Accumulates all incoming standard input data.

systemProcess.standardInput.beginReading(); // Start listening for input.
systemProcess.standardInput.specifyEncoding('utf8'); // Set input encoding.

// Event listener for incoming data segments.
systemProcess.standardInput.attachListener('data', function (dataSegment) {
    dataBuffer += dataSegment; // Append new data to the buffer.
});

// Event listener for the end of standard input.
systemProcess.standardInput.attachListener('completionEvent', function () {
    var parsedLines = dataBuffer.split('\n'); // Split buffer into individual lines.

    // Represents a single element within the binary structure.
    var Element = (function () {
        function Element() {
            _verifyClassCall(this, Element); // Ensure proper constructor call.

            this.childLeft = null;
            this.childRight = null;
            this.ancestorNode = null;
        }

        _establishClass(Element, [{
            key: 'placeLeftChild',
            value: function placeLeftChild(childElement) {
                this.childLeft = childElement;
                childElement.ancestorNode = this;
            }
        }, {
            key: 'placeRightChild',
            value: function placeRightChild(childElement) {
                this.childRight = childElement;
                childElement.ancestorNode = this;
            }
        }, {
            key: 'toTextString',
            value: function toTextString() {
                // Generates a string representation of the element and its children.
                return (
                    '(' +
                    (this.childLeft == null ? '' : this.childLeft.toTextString()) +
                    ',' +
                    (this.childRight == null ? '' : this.childRight.toTextString()) +
                    ')'
                );
            }
        }]);

        return Element;
    })();

    // Function to construct a binary structure from a string representation.
    var buildStructure = function buildStructure(inputStringData) {
        var baseElement = new Element();
        var currentStructure = baseElement;
        var separatorCount = 0; // Tracks if we are parsing the left or right child.
        var isIterationComplete = true;
        var hadIterationError = false;
        var iterationFault = undefined;

        try {
            for (
                var stringSymbolIterator = inputStringData[Symbol.iterator](), currentIterationStep;
                !(isIterationComplete = (currentIterationStep = stringSymbolIterator.next()).done);
                isIterationComplete = true
            ) {
                var currentChar = currentIterationStep.value;

                if (currentChar == "(") {
                    var newChildElement = new Element();
                    if (separatorCount == 0) currentStructure.placeLeftChild(newChildElement);
                    else currentStructure.placeRightChild(newChildElement);
                    currentStructure = newChildElement; // Move down to the new child.
                }
                if (currentChar == ",") separatorCount = 1; // Switch to parsing the right child.
                if (currentChar == ")") {
                    currentStructure = currentStructure.ancestorNode; // Move up to the parent.
                    separatorCount = 0; // Reset for potential next sibling.
                }
            }
        } catch (err) {
            hadIterationError = true;
            iterationFault = err;
        } finally {
            try {
                if (!isIterationComplete && stringSymbolIterator.return) {
                    stringSymbolIterator.return();
                }
            } finally {
                if (hadIterationError) {
                    throw iterationFault;
                }
            }
        }

        return baseElement.childLeft; // Return the actual root of the constructed structure.
    };

    // Computes the union of two binary structures.
    var combineStructures = function combineStructures(firstStructure, secondStructure) {
        var newElement = new Element();
        if (firstStructure == null) return secondStructure; // If first is empty, return second.
        if (secondStructure == null) return firstStructure; // If second is empty, return first.

        // Recursively combine left children.
        var recursiveResult = combineStructures(firstStructure.childLeft, secondStructure.childLeft);
        if (recursiveResult != null) newElement.placeLeftChild(recursiveResult);

        // Recursively combine right children.
        recursiveResult = combineStructures(firstStructure.childRight, secondStructure.childRight);
        if (recursiveResult != null) newElement.placeRightChild(recursiveResult);

        return newElement;
    };

    // Computes the intersection of two binary structures.
    var findCommonStructures = function findCommonStructures(firstStructure, secondStructure) {
        var newElement = new Element();
        if (firstStructure == null || secondStructure == null) return null; // If either is empty, no intersection.

        // Recursively find intersection of left children.
        var recursiveResult = findCommonStructures(firstStructure.childLeft, secondStructure.childLeft);
        if (recursiveResult != null) newElement.placeLeftChild(recursiveResult);

        // Recursively find intersection of right children.
        recursiveResult = findCommonStructures(firstStructure.childRight, secondStructure.childRight);
        if (recursiveResult != null) newElement.placeRightChild(recursiveResult);

        return newElement;
    };

    var isMainLoopComplete = true;
    var hadMainLoopError = false;
    var mainLoopFault = undefined;

    try {
        for (
            var linesSymbolIterator = parsedLines[Symbol.iterator](), mainLoopStep;
            !(isMainLoopComplete = (mainLoopStep = linesSymbolIterator.next()).done);
            isMainLoopComplete = true
        ) {
            var currentLineData = mainLoopStep.value;

            // Skip empty lines, often at the end of input.
            if (!currentLineData.trim()) continue;

            var linePartsArray = currentLineData.split(' ');
            var destructuredParts = _destructureArray(linePartsArray, 3);

            var operationKind = destructuredParts[0];
            var firstStructureString = destructuredParts[1];
            var secondStructureString = destructuredParts[2];

            var parsedStructureOne = buildStructure(firstStructureString);
            var parsedStructureTwo = buildStructure(secondStructureString);
            var finalOutcome = undefined;

            // Perform the specified operation.
            if (operationKind == "u") {
                finalOutcome = combineStructures(parsedStructureOne, parsedStructureTwo);
            } else if (operationKind == "i") {
                finalOutcome = findCommonStructures(parsedStructureOne, parsedStructureTwo);
            }

            // Output the string representation of the result.
            systemProcess.stdout.write(finalOutcome.toTextString() + '\n');
        }
    } catch (err) {
        hadMainLoopError = true;
        mainLoopFault = err;
    } finally {
        try {
            if (!isMainLoopComplete && linesSymbolIterator.return) {
                linesSymbolIterator.return();
            }
        } finally {
            if (hadMainLoopError) {
                throw mainLoopFault;
            }
        }
    }
});