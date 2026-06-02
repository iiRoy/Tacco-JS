var _jsCompLib = _jsCompLib || {};
_jsCompLib.internalScope = {};
_jsCompLib.ASSUME_ES5_COMPAT = !1;
_jsCompLib.ASSUME_NO_NATIVE_MAP_SUPPORT = !1;
_jsCompLib.ASSUME_NO_NATIVE_SET_SUPPORT = !1;
_jsCompLib.SIMPLE_FROUND_POLYFILL_ENABLED = !1;
_jsCompLib.defineObjectProperty = _jsCompLib.ASSUME_ES5_COMPAT || "function" == typeof Object.defineProperties ? Object.defineProperty : function(targetObj, propName, propDesc) {
    targetObj != Array.prototype && targetObj != Object.prototype && (targetObj[propName] = propDesc.value)
};
_jsCompLib.retrieveGlobalObject = function(currentContext) {
    return "undefined" != typeof window && window === currentContext ? currentContext : "undefined" != typeof global && null != global ? global : currentContext
};
_jsCompLib.globalReference = _jsCompLib.retrieveGlobalObject(this);
_jsCompLib.applyPolyfill = function(featureName, featureFactory, scopeObj, versionStr) {
    if (featureFactory) {
        scopeObj = _jsCompLib.globalReference;
        featureName = featureName.split(".");
        for (versionStr = 0; versionStr < featureName.length - 1; versionStr++) {
            var partName = featureName[versionStr];
            partName in scopeObj || (scopeObj[partName] = {});
            scopeObj = scopeObj[partName]
        }
        featureName = featureName[featureName.length - 1];
        versionStr = scopeObj[featureName];
        featureFactory = featureFactory(versionStr);
        featureFactory != versionStr && null != featureFactory && _jsCompLib.defineObjectProperty(scopeObj, featureName, {
            configurable: !0,
            writable: !0,
            value: featureFactory
        })
    }
};
_jsCompLib.applyPolyfill("Array.from", function(existingFrom) {
    return existingFrom ? existingFrom : function(sourceIterable, mappingFunction, thisContext) {
        mappingFunction = null != mappingFunction ? mappingFunction : function(val) {
            return val
        };
        var resultArray = [],
            iterableIterator = "undefined" != typeof Symbol && Symbol.iterator && sourceIterable[Symbol.iterator];
        if ("function" == typeof iterableIterator) {
            sourceIterable = iterableIterator.call(sourceIterable);
            for (var currentIndex = 0; !(iterableIterator = sourceIterable.next()).done;) resultArray.push(mappingFunction.call(thisContext, iterableIterator.value, currentIndex++))
        } else
            for (iterableIterator = sourceIterable.length, currentIndex = 0; currentIndex < iterableIterator; currentIndex++) resultArray.push(mappingFunction.call(thisContext, sourceIterable[currentIndex], currentIndex));
        return resultArray
    }
}, "es6", "es3");

function processInput(inputData) {
    var inputLines = inputData.split("\n");
    var itemCount = parseInt(inputLines[0]);
    var originalNumbers = [];
    inputLines[1] = inputLines[1].split(" ");
    for (var idx = 0; idx < itemCount; ++idx) originalNumbers.push(parseInt(inputLines[1][idx]));
    var sortedNumbers = Array.from(originalNumbers);
    sortedNumbers.sort();
    console.log(originalNumbers, sortedNumbers);
    var diffCount = 0;
    for (var currIdx = 0; currIdx < itemCount; ++currIdx) {
        if (originalNumbers[currIdx] != sortedNumbers[currIdx]) {
            diffCount += 1;
        }
    }
    console.log(2 >= diffCount ? "YES" : "NO")
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
