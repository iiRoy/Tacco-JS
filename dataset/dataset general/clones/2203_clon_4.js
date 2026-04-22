(function() {

var GLOBAL_SETTINGS = window.GLOBAL_SETTINGS || {};

var platform = window.platform || {};

window.platform = platform;

window.coreModule = platform.editorFramework = window.coreModule || {};

coreModule.addons = {};

coreModule.actions = {};

coreModule.instances = {};

coreModule.localization = {};

coreModule.customElements = {};

coreModule.release = "1.4.3";

var documentOperations = coreModule.documentOps = {};

var clientEnvironmentDetector = coreModule.clientAgent = (function() {
    var userAgentString = navigator.userAgent.toLowerCase(),
        operaGlobal = window.opera,
        environmentDetails = {};

    var extractValueFromRegex = function(regexPattern, sourceText) {
        var matchResult = sourceText.match(regexPattern);
        return matchResult && matchResult[1] ? parseFloat(matchResult[1]) : null;
    };

    environmentDetails.isTrident = /(msie\s|trident.*rv:)([\w.]+)/.test(userAgentString);
    environmentDetails.isPreamble = (!!operaGlobal && operaGlobal.version);
    environmentDetails.isWebCore = (userAgentString.indexOf(' applewebkit/') > -1);
    environmentDetails.isApple = (userAgentString.indexOf('macintosh') > -1);
    environmentDetails.isLegacyMode = (document.compatMode === 'BackCompat');

    environmentDetails.isMozillaCore = (navigator.product === 'Gecko' && !environmentDetails.isWebCore && !environmentDetails.isPreamble && !environmentDetails.isTrident);

    var currentCoreVersion = 0;

    if (environmentDetails.isTrident) {
        var tridentIdentifier1 = extractValueFromRegex(/(?:msie\s([\w.]+))/, userAgentString);
        var tridentIdentifier2 = extractValueFromRegex(/(?:trident.*rv:([\w.]+))/, userAgentString);

        if (tridentIdentifier1 !== null && tridentIdentifier2 !== null) {
            currentCoreVersion = Math.max(tridentIdentifier1, tridentIdentifier2);
        } else if (tridentIdentifier1 !== null) {
            currentCoreVersion = tridentIdentifier1;
        } else if (tridentIdentifier2 !== null) {
            currentCoreVersion = tridentIdentifier2;
        } else {
            currentCoreVersion = 0;
        }

        var docModeValue = document.documentMode;
        environmentDetails.trident11 = docModeValue === 11;
        environmentDetails.trident9 = docModeValue === 9;
        environmentDetails.trident8Active = !!docModeValue;
        environmentDetails.trident8Compat = docModeValue === 8;
        environmentDetails.trident7Compat = ((currentCoreVersion === 7 && !docModeValue) || docModeValue === 7);
        environmentDetails.trident6Compat = (currentCoreVersion < 7 || environmentDetails.isLegacyMode);
        environmentDetails.trident9Plus = currentCoreVersion > 8;
        environmentDetails.trident9Minus = currentCoreVersion < 9;
        environmentDetails.trident11Plus = currentCoreVersion > 10;
        environmentDetails.trident11Minus = currentCoreVersion < 11;
    }

    if (environmentDetails.isMozillaCore) {
        var geckoReleaseMatch = userAgentString.match(/rv:([\d\.]+)/);
        if (geckoReleaseMatch) {
            var releaseSegments = geckoReleaseMatch[1].split('.');
            currentCoreVersion = parseInt(releaseSegments[0] || 0) * 10000 +
                                 parseInt(releaseSegments[1] || 0) * 100 +
                                 parseInt(releaseSegments[2] || 0) * 1;
        }
    }

    var chromeVersionMatch = userAgentString.match(/chrome\/(\d+\.\d)/i);
    if (chromeVersionMatch) {
        environmentDetails.isChromium = parseFloat(chromeVersionMatch[1]);
    }

    var safariVersionMatch = userAgentString.match(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i);
    if (safariVersionMatch && !environmentDetails.isChromium) {
        environmentDetails.isVoyager = parseFloat(safariVersionMatch[1] || safariVersionMatch[2]);
    }

    if (environmentDetails.isPreamble)
        currentCoreVersion = parseFloat(operaGlobal.version());

    if (environmentDetails.isWebCore) {
        var webkitBuildMatch = userAgentString.match(/ applewebkit\/(\d+)/);
        if (webkitBuildMatch) {
            currentCoreVersion = parseFloat(webkitBuildMatch[1]);
        }
    }

    environmentDetails.coreVersion = currentCoreVersion;

    var isMobileDevice = false; // Assuming false as it's not determined in this snippet

    environmentDetails.isOptimal =
        !isMobileDevice && (
        ( environmentDetails.isTrident && currentCoreVersion >= 6 ) ||
        ( environmentDetails.isMozillaCore && currentCoreVersion >= 10801 ) ||
        ( environmentDetails.isPreamble && currentCoreVersion >= 9.5 ) ||
        ( false && currentCoreVersion >= 1 ) || // Mimics 'air' check which is not defined
        ( environmentDetails.isWebCore && currentCoreVersion >= 522 ) ||
        false );
    return environmentDetails;
})();

var tridentAgent = clientEnvironmentDetector.isTrident,
    webcoreAgent = clientEnvironmentDetector.isWebCore,
    mozillaAgent = clientEnvironmentDetector.isMozillaCore,
    preambleAgent = clientEnvironmentDetector.isPreamble;

var helperFunctions = coreModule.helpers = {

    traverseCollection : function(sourceData, processorFunction, callScope) {
        if (sourceData == null) return;
        if (typeof sourceData.length === 'number' && sourceData.length >= 0 && (sourceData.length === 0 || (sourceData.length - 1) in sourceData)) {
            for (var currentIdx = 0, dataLen = sourceData.length; currentIdx < dataLen; currentIdx++) {
                if (processorFunction.call(callScope, sourceData[currentIdx], currentIdx, sourceData) === false)
                    return false;
            }
        } else {
            var keys = Object.keys(sourceData);
            for (var kIdx = 0; kIdx < keys.length; kIdx++) {
                var currentKey = keys[kIdx];
                if (processorFunction.call(callScope, sourceData[currentKey], currentKey, sourceData) === false)
                    return false;
            }
        }
    },

    createPrototypicalObject: function(baseObject) {
        if (Object.create) {
            return Object.create(baseObject);
        } else {
            var IntermediateConstructor = function() {};
            IntermediateConstructor.prototype = baseObject;
            var newObject = new IntermediateConstructor();
            IntermediateConstructor.prototype = null;
            return newObject;
        }
    },

    amalgamateProperties: function(targetContainer, sourcePayload, preserveExisting) {
        if (sourcePayload) {
            Object.keys(sourcePayload).forEach(function(propKey) {
                if (!preserveExisting || !targetContainer.hasOwnProperty(propKey)) {
                    targetContainer[propKey] = sourcePayload[propKey];
                }
            });
        }
        return targetContainer;
    },

    overlayProperties: function(mainTarget) {
        var allArguments = arguments;
        for (var argIndex = 1; argIndex < allArguments.length; argIndex++) {
            var currentSource = allArguments[argIndex];
            if (currentSource) {
                Object.keys(currentSource).forEach(function(propKey) {
                    if (!mainTarget.hasOwnProperty(propKey)) {
                        mainTarget[propKey] = currentSource[propKey];
                    }
                });
            }
        }
        return mainTarget;
    }
};

})();