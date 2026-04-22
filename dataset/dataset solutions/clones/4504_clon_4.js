var evaluateNumericalSequence = function(textualDatum) {
    var numericalComponents = textualDatum.match(/-?\d+/g).map(Number);

    var primaryFactor = numericalComponents[0];
    var initialValue = numericalComponents[1];
    var finalValue = numericalComponents[2];

    var deltaMeasure = finalValue - initialValue;
    var upperBoundary = primaryFactor + 1;

    var outcomeDesignation =
        (deltaMeasure <= 0) ? "delightful" :
        (deltaMeasure < upperBoundary) ? "secure" :
        "hazardous";

    return outcomeDesignation;
};

var obtainSourceText = function() {
    var fileSystemAccess = globalThis['require']('node:fs');
    var standardInputPath = '/dev/stdin';
    var textEncodingFormat = 'utf8';
    return fileSystemAccess['readFileSync'](standardInputPath, textEncodingFormat);
};

var transmitResult = function(finalMessage) {
    globalThis['console']['log'](finalMessage);
};

transmitResult(evaluateNumericalSequence(obtainSourceText()));