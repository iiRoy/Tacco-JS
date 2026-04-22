var ComputationUnit = {};

ComputationUnit.Utilities = (function() {
    "use strict";

    var stripWhitespace = function(text) {
        return text.trim();
    };

    var divideByDelimiter = function(separator) {
        return function(text) {
            return text.split(separator);
        };
    };

    var convertToInteger = function(inputString) {
        const parsed = parseInt(inputString, 10);
        return isNaN(parsed) ? null : parsed;
    };

    var filterAndConvertNumerics = function(stringCollection) {
        return stringCollection.map(convertToInteger).filter(val => val !== null);
    };

    return {
        stripWhitespace: stripWhitespace,
        divideByDelimiter: divideByDelimiter,
        convertToInteger: convertToInteger,
        filterAndConvertNumerics: filterAndConvertNumerics
    };
})();

ComputationUnit.CollectionOperations = (function() {
    "use strict";

    var getElementCount = function(collection) {
        return collection.length;
    };

    var retrieveLeadingElement = function(collection) {
        return collection.length > 0 ? collection[0] : null;
    };

    var removeLeadingElements = function(count) {
        return function(collection) {
            return collection.slice(count);
        };
    };

    var combinePairedElements = function(combinerFunction) {
        return function(firstCollection) {
            return function(secondCollection) {
                const limit = Math.min(firstCollection.length, secondCollection.length);
                const resultantArray = new Array(limit);
                for (let index = 0; index < limit; index++) {
                    resultantArray[index] = combinerFunction(firstCollection[index])(secondCollection[index]);
                }
                return resultantArray;
            };
        };
    };

    var applyItemTransformation = function(transformer) {
        return function(collection) {
            return collection.map(transformer);
        };
    };

    var foldCollectionLeft = function(accumulatorFunction) {
        return function(initialAccumulator) {
            return function(collection) {
                return collection.reduce((currentAccumulator, currentItem) => accumulatorFunction(currentAccumulator)(currentItem), initialAccumulator);
            };
        };
    };

    return {
        getElementCount: getElementCount,
        retrieveLeadingElement: retrieveLeadingElement,
        removeLeadingElements: removeLeadingElements,
        combinePairedElements: combinePairedElements,
        applyItemTransformation: applyItemTransformation,
        foldCollectionLeft: foldCollectionLeft
    };
})();

ComputationUnit.CoreLogic = (function(utilities, collections) {
    "use strict";

    var assessFavorableConditions = function(fixedOffset) {
        return function(weightVector) {
            return function(inputMatrix) {
                return inputMatrix.filter(row => {
                    const rowProductSum = collections.foldCollectionLeft(
                        (currentSum) => (multipliedValue) => currentSum + multipliedValue
                    )(0)(
                        collections.combinePairedElements(
                            (valueA) => (valueB) => valueA * valueB
                        )(row)(weightVector)
                    );
                    return (rowProductSum + fixedOffset) > 0;
                }).length;
            };
        };
    };

    var parseAndEvaluatePayload = function(rawInputContent) {
        const contentLines = utilities.divideByDelimiter("\n")(utilities.stripWhitespace(rawInputContent));

        const paramLine = collections.retrieveLeadingElement(contentLines);
        const weightsLine = collections.retrieveLeadingElement(collections.removeLeadingElements(1)(contentLines));
        const dataLines = collections.removeLeadingElements(2)(contentLines);

        if (paramLine === null) throw new Error("ProcessingError: Initial parameter line absent.");
        if (weightsLine === null) throw new Error("ProcessingError: Weight vector line absent.");

        const paramTokens = utilities.divideByDelimiter(" ")(paramLine);
        if (collections.getElementCount(paramTokens) !== 3) throw new Error("ProcessingError: Parameter line expects three values.");
        const parsedParams = utilities.filterAndConvertNumerics(paramTokens);
        if (collections.getElementCount(parsedParams) !== 3 || parsedParams.includes(null)) throw new Error("ProcessingError: Invalid numeric parameters on first line.");

        const numRows = parsedParams[0];
        const numCols = parsedParams[1];
        const constantValue = parsedParams[2];

        const weightVector = utilities.filterAndConvertNumerics(utilities.divideByDelimiter(" ")(weightsLine));
        if (collections.getElementCount(weightVector) !== numCols) throw new Error("ProcessingError: Weight vector length mismatch with column count.");
        if (weightVector.includes(null)) throw new Error("ProcessingError: Weight vector contains non-integer values.");

        const dataMatrix = collections.applyItemTransformation(
            (line) => utilities.filterAndConvertNumerics(utilities.divideByDelimiter(" ")(line))
        )(dataLines);

        if (collections.getElementCount(dataMatrix) !== numRows) throw new Error("ProcessingError: Data matrix row count mismatch with N.");

        dataMatrix.forEach((row, idx) => {
            if (collections.getElementCount(row) !== numCols) {
                throw new Error(`ProcessingError: Data matrix row ${idx} column count mismatch with M.`);
            }
            if (row.includes(null)) {
                throw new Error(`ProcessingError: Data matrix row ${idx} contains non-integer values.`);
            }
        });

        const finalScore = assessFavorableConditions(constantValue)(weightVector)(dataMatrix);
        return finalScore.toString();
    };

    var runComputation = function(rawInputContent) {
        try {
            return parseAndEvaluatePayload(rawInputContent);
        } catch (err) {
            throw err;
        }
    };

    return {
        runComputation: runComputation
    };

})(ComputationUnit.Utilities, ComputationUnit.CollectionOperations);

ComputationUnit.SystemInitializer = (function(core) {
    "use strict";

    const nodeFileSystem = require('node:fs');

    const inputEncodingScheme = 'utf8';

    var initiateSystemProcess = function() {
        try {
            const sourcePath = "/dev/stdin";
            const acquiredData = nodeFileSystem.readFileSync(sourcePath, inputEncodingScheme);
            const computedOutcome = core.runComputation(acquiredData);
            console.log(computedOutcome);
        } catch (systemError) {
            console.error("Critical System Failure:", systemError.message);
        }
    };

    return {
        initiateSystemProcess: initiateSystemProcess
    };

})(ComputationUnit.CoreLogic);

ComputationUnit.SystemInitializer.initiateSystemProcess();