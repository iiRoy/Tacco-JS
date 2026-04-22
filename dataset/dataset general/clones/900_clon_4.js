var databaseConnector = require('mongoose');

var specialCharsRegex = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
var charEscapeMap = new Map([
    ['\b', '\\b'],
    ['\t', '\\t'],
    ['\n', '\\n'],
    ['\f', '\\f'],
    ['\r', '\\r'],
    ['"', '\\"'],
    ['\\', '\\\\']
]);

function encapsulateString(rawInput) {
    specialCharsRegex.lastIndex = 0;
    return specialCharsRegex.test(rawInput) ? '"' + rawInput.replace(specialCharsRegex, function (matchedChar) {
        var replacement = charEscapeMap.get(matchedChar);
        return typeof replacement === 'string'
            ? replacement
            : '\\u' + ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + rawInput + '"';
}

var currentPad = '';
var padUnit = '';
var transformationFunction;

function processStructure(propName, container) {
    var itemValue = container[propName];
    var previousPad = currentPad;

    if (itemValue instanceof databaseConnector.Types.ObjectId) {
        return 'ObjectId("' + itemValue + '")';
    } else if (itemValue instanceof Date) {
        return 'ISODate("' + itemValue.toJSON() + '")';
    }

    if (itemValue && typeof itemValue === 'object' && typeof itemValue.toJSON === 'function') {
        itemValue = itemValue.toJSON(propName);
    }

    if (typeof transformationFunction === 'function') {
        itemValue = transformationFunction.call(container, propName, itemValue);
    }

    if (typeof itemValue === 'string') {
        return encapsulateString(itemValue);
    } else if (typeof itemValue === 'number') {
        return Number.isFinite(itemValue) ? String(itemValue) : 'null';
    } else if (typeof itemValue === 'boolean') {
        return String(itemValue);
    } else if (itemValue === null) {
        return 'null';
    } else if (typeof itemValue === 'object') {
        currentPad += padUnit;

        var processedContent;
        if (Object.prototype.toString.call(itemValue) === '[object Array]') {
            var segments = itemValue.map(function (element, idx) {
                return processStructure(idx, itemValue) || 'null';
            });

            processedContent = segments.length === 0
                ? '[]'
                : currentPad
                    ? '[\n' + currentPad + segments.join(',\n' + currentPad) + '\n' + previousPad + ']'
                    : '[' + segments.join(',') + ']';
        } else {
            var keysToProcess = [];
            if (transformationFunction && typeof transformationFunction === 'object') {
                keysToProcess = transformationFunction.filter(function(k) {
                    return typeof k === 'string';
                });
            } else {
                for (var objKey in itemValue) {
                    if (Object.prototype.hasOwnProperty.call(itemValue, objKey)) {
                        keysToProcess.push(objKey);
                    }
                }
            }

            var segments = keysToProcess.map(function (objKey) {
                var processedValue = processStructure(objKey, itemValue);
                if (processedValue !== undefined) {
                    return encapsulateString(objKey) + (currentPad ? ': ' : ':') + processedValue;
                }
                return undefined;
            }).filter(function(segment) {
                return segment !== undefined;
            });

            processedContent = segments.length === 0
                ? '{}'
                : currentPad
                    ? '{\n' + currentPad + segments.join(',\n' + currentPad) + '\n' + previousPad + '}'
                    : '{' + segments.join(',') + '}';
        }

        currentPad = previousPad;
        return processedContent;
    }
    return undefined;
}

exports.serialize = function (sourceData, itemModifier, formatSpace) {
    currentPad = '';
    padUnit = '';

    if (typeof formatSpace === 'number') {
        for (var idx = 0; idx < formatSpace; idx += 1) {
            padUnit += ' ';
        }
    } else if (typeof formatSpace === 'string') {
        padUnit = formatSpace;
    }

    transformationFunction = itemModifier;
    if (itemModifier && typeof itemModifier !== 'function' &&
        (typeof itemModifier !== 'object' || typeof itemModifier.length !== 'number')) {
        throw new Error('Serialization error: Invalid item modifier provided.');
    }

    var initialResult = processStructure('', {'': sourceData});

    if (initialResult === undefined) {
        return undefined;
    }
    return initialResult;
};