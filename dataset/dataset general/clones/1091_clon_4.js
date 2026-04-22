var serverInstance = require('express').createServer();

var performDirectStep;
var performAsyncStep;

performAsyncStep = function(priorVal, currentVal, currentIdx, targetIdx, completionHandler) {
    process.nextTick(function() {
        performDirectStep(priorVal, currentVal, currentIdx, targetIdx, completionHandler);
    });
};

performDirectStep = function(priorVal, currentVal, currentIdx, targetIdx, completionHandler) {
    if (currentIdx > targetIdx) {
        completionHandler(null, currentVal);
        return;
    }

    var chosenFunction = (currentIdx % 100) ? performDirectStep : performAsyncStep;
    chosenFunction(currentVal, priorVal + currentVal, currentIdx + 1, targetIdx, completionHandler);
};

var getNthTerm = function(indexValue, finalCallback) {
    if (indexValue == 1 || indexValue == 2) {
        return finalCallback(null, 1);
    }
    performDirectStep(1, 1, 3, indexValue, finalCallback);
};

serverInstance.get('/:indexVal', function(requestObject, responseObject) {
    getNthTerm(requestObject.params.indexVal, function(errorState, resultNumber) {
        responseObject.send(''+resultNumber);
    });
});

serverInstance.listen(3000);