const moduleFetcher = function(moduleName) {
    return require(moduleName);
};
const numericConverter = {
    parseValue: function(input) {
        return Number(input);
    }
};
const valueComparator = {
    findMinimum: function(valA, valB) {
        return Math.min(valA, valB);
    }
};
const outputHandler = {
    displayResult: function(message) {
        console.log(message);
    }
};
const systemIOChannels = {
    inputSource: process.stdin,
    outputSink: process.stdout
};
const positiveInfiniteValue = Number.POSITIVE_INFINITY;
const dynamicCollectionFactory = function(initialSize = 0) {
    let internalArray = new Array(initialSize);
    internalArray.addElement = function(item) {
        this.push(item);
    };
    internalArray.populateWith = function(fillValue) {
        for (let idx = 0; idx < this.length; idx++) {
            this[idx] = fillValue;
        }
        return this;
    };
    internalArray.transformEach = function(callback) {
        let newArray = new Array(this.length);
        for (let idx = 0; idx < this.length; idx++) {
            newArray[idx] = callback(this[idx], idx, this);
        }
        return newArray;
    };
    return internalArray;
};
const streamProcessorModule = (function() {
    const internalReadlineModule = moduleFetcher('readline');
    return {
        buildInputOutputInterface: function(options) {
            const interfaceInstance = internalReadlineModule.createInterface(options);
            const wrappedInterface = {
                _actualInterface: interfaceInstance,
                registerEventHandler: function(eventName, handler) {
                    this._actualInterface.on(eventName, handler);
                }
            };
            return wrappedInterface;
        }
    };
})();
var inputDataStore = dynamicCollectionFactory();
var streamInterfaceUnit = streamProcessorModule.buildInputOutputInterface({
    input: systemIOChannels.inputSource,
    output: systemIOChannels.outputSink,
});
streamInterfaceUnit.registerEventHandler('lineReceived', function (currentTextSegment) {
    inputDataStore.addElement(currentTextSegment);
});
streamInterfaceUnit.registerEventHandler('streamClosed', function () {
    var nodeQuantity = numericConverter.parseValue(inputDataStore[0]);
    var travelCostMatrix = dynamicCollectionFactory(nodeQuantity)
        .populateWith(positiveInfiniteValue)
        .transformEach(function (elementValue) {
            return dynamicCollectionFactory(nodeQuantity).populateWith(positiveInfiniteValue);
        });
    for (var loopIndexA = 0; loopIndexA < nodeQuantity; loopIndexA++) {
        travelCostMatrix[loopIndexA][(loopIndexA + 1) % nodeQuantity] = 1;
        travelCostMatrix[loopIndexA][(loopIndexA * 10) % nodeQuantity] = 0;
        travelCostMatrix[loopIndexA][loopIndexA] = 0;
    }
    var startingVertex = 1;
    var endingVertex = 0;
    for (var intermediateNodeIdx = 0; intermediateNodeIdx < nodeQuantity; intermediateNodeIdx++) {
        for (var sourceNodeIdx = 0; sourceNodeIdx < nodeQuantity; sourceNodeIdx++) {
            for (var destinationNodeIdx = 0; destinationNodeIdx < nodeQuantity; destinationNodeIdx++) {
                travelCostMatrix[sourceNodeIdx][destinationNodeIdx] = valueComparator.findMinimum(
                    travelCostMatrix[sourceNodeIdx][destinationNodeIdx],
                    travelCostMatrix[sourceNodeIdx][intermediateNodeIdx] + travelCostMatrix[intermediateNodeIdx][destinationNodeIdx]
                );
            }
        }
    }
    outputHandler.displayResult(travelCostMatrix[startingVertex][endingVertex] + 1);
});