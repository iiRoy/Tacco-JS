(function (windowRef) {
    if (windowRef.requestAnimationFrame) {
        return;
    }

    var animationSuffix = "RequestAnimationFrame";
    var vendorPrefixes = ["webkit", "moz", "o", "ms"];
    var foundPrefix = null;

    for (var k = 0; k < vendorPrefixes.length; k++) {
        if (windowRef[vendorPrefixes[k] + animationSuffix] != null) {
            foundPrefix = vendorPrefixes[k];
            break;
        }
    }

    if (foundPrefix) {
        windowRef.requestAnimationFrame = windowRef[foundPrefix + animationSuffix];
        windowRef.cancelRequestAnimationFrame = windowRef[foundPrefix + "Cancel" + animationSuffix];
        return;
    }

    var nominalFrameRate = 60;
    var frameIntervalMs = 1000 / nominalFrameRate;

    var activeCallbacks = new Map();
    var uniqueCallId = 1;
    var currentIntervalIdentifier = null;

    var getCurrentMoment = Date.now || function () {
        return (new Date()).getTime();
    };

    function executeAnimationCallbacks() {
        var timeOfFrame = getCurrentMoment();
        var callbacksForThisFrame = new Map(activeCallbacks);
        
        activeCallbacks.clear();

        callbacksForThisFrame.forEach(function (callbackFn) {
            callbackFn(timeOfFrame);
        });

        if (activeCallbacks.size === 0 && currentIntervalIdentifier !== null) {
            clearInterval(currentIntervalIdentifier);
            currentIntervalIdentifier = null;
        }
    }

    windowRef.requestAnimationFrame = function (callbackFunction, unusedRootElement) {
        var assignedId = uniqueCallId++;
        activeCallbacks.set(assignedId, callbackFunction);

        if (currentIntervalIdentifier === null) {
            currentIntervalIdentifier = setInterval(executeAnimationCallbacks, frameIntervalMs);
        }

        return assignedId;
    };

    windowRef.cancelRequestAnimationFrame = function (requestIdentifier) {
        activeCallbacks.delete(requestIdentifier);

        if (activeCallbacks.size === 0 && currentIntervalIdentifier !== null) {
            clearInterval(currentIntervalIdentifier);
            currentIntervalIdentifier = null;
        }
    };

})(this);