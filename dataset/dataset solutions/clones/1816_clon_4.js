var fsModule = global.require("node:fs");

var acquireRawText = function() {
    return fsModule.readFileSync("/dev/stdin", "utf8");
};

var createDataStream = function(sourceText) {
    var tokens = sourceText.split(/\s+/).filter(Boolean);
    var tokenPointer = 0;

    return {
        extractNext: function(conversionMethod) {
            if (tokenPointer >= tokens.length) {
                throw new Error("Insufficient data for extraction");
            }
            var currentToken = tokens[tokenPointer];
            tokenPointer++;
            return conversionMethod(currentToken);
        }
    };
};

var calculateFinalValue = function(streamFactoryFunction) {
    var dataFlow = streamFactoryFunction();

    var primaryValue = dataFlow.extractNext(BigInt);
    var secondaryRawValue = dataFlow.extractNext(parseFloat);

    var secondaryAdjustedValue = BigInt(Math.trunc(secondaryRawValue * 1000));

    var intermediateProduct = primaryValue * secondaryAdjustedValue;
    var finalQuotient = intermediateProduct / 1000n;

    return finalQuotient.toString();
};

var orchestrateExecution = function() {
    var contentSource = acquireRawText();
    var streamCreator = function() { return createDataStream(contentSource); };

    return calculateFinalValue(streamCreator);
};

console.log(orchestrateExecution());