var JSTextProcessor = {};

(function () {
    'use strict';

    function padDigits(numberVal) {
        return numberVal < 10 ? '0' + numberVal : String(numberVal);
    }

    var unicodeControlCharsPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var specialCharsEscaper = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var escapeLookup = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };

    var currentIndent = '',
        indentUnit = '',
        activeReplacer;

    function wrapAndEscapeString(initialString) {
        specialCharsEscaper.lastIndex = 0;
        return specialCharsEscaper.test(initialString) ? '"' + initialString.replace(specialCharsEscaper, function (charMatch) {
            var replacement = escapeLookup[charMatch];
            return typeof replacement === 'string'
                ? replacement
                : '\\u' + ('0000' + charMatch.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + initialString + '"';
    }

    function processNode(propertyIdentifier, containerObject) {
        var idx, prop, item, count;
        var previousIndent = currentIndent;
        var segmentCollection;
        var currentElement = containerObject[propertyIdentifier];

        // Process objects that have special serialization behavior in the original json2.js
        if (currentElement && typeof currentElement === 'object') {
            // Explicitly handle Date objects, matching json2.js's patched Date.prototype.toJSON behavior
            if (currentElement instanceof Date) {
                if (!isFinite(currentElement.valueOf())) {
                    return 'null'; // Invalid Date
                }
                let yr = currentElement.getUTCFullYear();
                let mon = padDigits(currentElement.getUTCMonth() + 1);
                let dt = padDigits(currentElement.getUTCDate());
                let hr = padDigits(currentElement.getUTCHours());
                let min = padDigits(currentElement.getUTCMinutes());
                let sec = padDigits(currentElement.getUTCSeconds());
                return `"${yr}-${mon}-${dt}T${hr}:${min}:${sec}Z"`;
            }
            // Handle primitive wrapper objects (String, Number, Boolean)
            // matching json2.js's patched .toJSON behavior which returns .valueOf()
            else if (currentElement instanceof String ||
                     currentElement instanceof Number ||
                     currentElement instanceof Boolean) {
                currentElement = currentElement.valueOf();
            }
            // Apply generic .toJSON method if present (as per JSON specification)
            else if (typeof currentElement.toJSON === 'function') {
                currentElement = currentElement.toJSON(propertyIdentifier);
            }
        }

        // Apply replacer function if provided
        if (typeof activeReplacer === 'function') {
            currentElement = activeReplacer.call(containerObject, propertyIdentifier, currentElement);
        }

        // Process based on type of the (potentially transformed) currentElement
        switch (typeof currentElement) {
        case 'string':
            return wrapAndEscapeString(currentElement);

        case 'number':
            return isFinite(currentElement) ? String(currentElement) : 'null';

        case 'boolean':
        case 'null':
            return String(currentElement);

        case 'object':
            if (!currentElement) { // Handles null as well, typeof null is 'object'
                return 'null';
            }

            currentIndent += indentUnit;
            segmentCollection = [];

            // Handle arrays
            if (Object.prototype.toString.call(currentElement) === '[object Array]') {
                count = currentElement.length;
                for (idx = 0; idx < count; idx += 1) {
                    // Elements that cannot be serialized (undefined, functions) become 'null' in arrays
                    segmentCollection[idx] = processNode(idx, currentElement) || 'null';
                }

                item = segmentCollection.length === 0
                    ? '[]'
                    : indentUnit
                    ? '[\n' + currentIndent + segmentCollection.join(',\n' + currentIndent) + '\n' + previousIndent + ']'
                    : '[' + segmentCollection.join(',') + ']';
                currentIndent = previousIndent;
                return item;
            }

            // Handle objects
            if (activeReplacer && typeof activeReplacer === 'object') { // Replacer is an array of keys
                count = activeReplacer.length;
                for (idx = 0; idx < count; idx += 1) {
                    if (typeof activeReplacer[idx] === 'string') {
                        prop = activeReplacer[idx];
                        item = processNode(prop, currentElement);
                        if (item) { // Only include if serialization result is not undefined
                            segmentCollection.push(wrapAndEscapeString(prop) + (indentUnit ? ': ' : ':') + item);
                        }
                    }
                }
            } else { // Iterate all enumerable keys of the object
                for (prop in currentElement) {
                    if (Object.prototype.hasOwnProperty.call(currentElement, prop)) {
                        item = processNode(prop, currentElement);
                        if (item) { // Only include if serialization result is not undefined
                            segmentCollection.push(wrapAndEscapeString(prop) + (indentUnit ? ': ' : ':') + item);
                        }
                    }
                }
            }

            item = segmentCollection.length === 0
                ? '{}'
                : indentUnit
                ? '{\n' + currentIndent + segmentCollection.join(',\n' + currentIndent) + '\n' + previousIndent + '}'
                : '{' + segmentCollection.join(',') + '}';
            currentIndent = previousIndent;
            return item;
        }
        // For undefined and function types, return undefined so they are dropped from objects
        // (or converted to 'null' in arrays as per || 'null' above)
    }

    JSTextProcessor.serializeObjectToText = function (subjectValue, transformationRules, formattingGuidance) {
        var idx;
        currentIndent = '';
        indentUnit = '';

        // Determine indentation string based on formattingGuidance
        if (typeof formattingGuidance === 'number') {
            for (idx = 0; idx < formattingGuidance; idx += 1) {
                indentUnit += ' ';
            }
        } else if (typeof formattingGuidance === 'string') {
            indentUnit = formattingGuidance;
        }

        activeReplacer = transformationRules;
        // Validate replacer parameter
        if (transformationRules && typeof transformationRules !== 'function' &&
                (typeof transformationRules !== 'object' ||
                typeof transformationRules.length !== 'number')) {
            throw new Error('JSTextProcessor.serializeObjectToText: Invalid transformationRules parameter');
        }

        // Use a dummy root object to start the recursive serialization
        return processNode('', {'': subjectValue});
    };


    JSTextProcessor.deserializeTextToObject = function (inputContent, revisionCallback) {
        var parsedStructure;

        // Recursive function for reviver processing
        function navigateAndModify(container, propertyIdentifier) {
            var prop, item, currentElement = container[propertyIdentifier];
            if (currentElement && typeof currentElement === 'object') {
                for (prop in currentElement) {
                    if (Object.prototype.hasOwnProperty.call(currentElement, prop)) {
                        item = navigateAndModify(currentElement, prop);
                        if (item !== undefined) {
                            currentElement[prop] = item;
                        } else {
                            delete currentElement[prop];
                        }
                    }
                }
            }
            return revisionCallback.call(container, propertyIdentifier, currentElement);
        }

        inputContent = String(inputContent);
        unicodeControlCharsPattern.lastIndex = 0;
        // Pre-process Unicode control characters
        if (unicodeControlCharsPattern.test(inputContent)) {
            inputContent = inputContent.replace(unicodeControlCharsPattern, function (charMatch) {
                return '\\u' +
                    ('0000' + charMatch.charCodeAt(0).toString(16)).slice(-4);
            });
        }

        // Regexes for structural validation, renamed from original
        var jsonStructureValidator = /^[\],:{}\s]*$/;
        var escapedCharReplacer = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var valueTokenReplacer = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var arrayStartReplacer = /(?:^|:|,)(?:\s*\[)+/g;

        // Validate JSON structure using a sequence of regex replacements and a final test
        if (jsonStructureValidator
                .test(inputContent.replace(escapedCharReplacer, '@')
                    .replace(valueTokenReplacer, ']')
                    .replace(arrayStartReplacer, ''))) {

            // Parse the JSON string into a JavaScript structure using Function constructor (eval-like)
            parsedStructure = (new Function('return (' + inputContent + ')'))();

            // Apply reviver function if provided
            return typeof revisionCallback === 'function'
                ? navigateAndModify({'': parsedStructure}, '')
                : parsedStructure;
        }

        // If validation fails, throw a SyntaxError
        throw new SyntaxError('JSTextProcessor.deserializeTextToObject: Invalid JSON format');
    };
}());