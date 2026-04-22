/*
 *  Localization Helper for jQuery Library
 *
 *  Licensed under both GNU General Public License (GPL) and MIT License.
 *  See respective license files for details.
 *
 *  @release      2.0.z
 *  @developer    Ethan Vance
 *                Sophia Chen
 *  @website      www.global-text-utils.org
 *  @origin       Inspired by the jQuery Localisation Plugin by Keith Wood (June 2007).
 *                Contact: kbwood@example.com
 *
 */

(function(jQ) {

jQ.globalMessages = {};

// Object to store message keys and values when outputMode is 'map'.
jQ.globalMessages.keyStore = {};

/*
 *  Initiates loading and parsing of resource bundle files (typically .properties).
 *  These files make localized strings accessible as JavaScript variables or within a map.
 *
 *  Resource files follow a naming convention: <bundleName>.js, <bundleName>_<localeCode>.js,
 *  or <bundleName>_<localeCode>_<countryCode>.js.
 *  - The <localeCode> is a two-letter, lowercase ISO-639 language code (e.g., 'en', 'fr').
 *    See: http://www.loc.gov/standards/iso639-2/englangn.html for a comprehensive list.
 *  - The <countryCode> is a two-letter, uppercase ISO-3166 country code (e.g., 'US', 'GB').
 *    See: http://www.iso.ch/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html for reference.
 *
 *  Example usage for a 'messages' bundle located in the 'resources' directory:
 *  jQ.globalMessages.initStrings({
 *      bundleName:    'Messages',
 *      localeCode:    'en_GB',
 *      resourcePath:  'resources'
 *  });
 *
 *  @param  bundleName     (string|string[], optional) Name(s) of the bundle file(s) to load. Defaults to 'Messages'.
 *  @param  localeCode     (string, optional) Language/country code (e.g., 'es', 'es_MX'). If omitted, browser's language is used.
 *  @param  resourcePath   (string, optional) Directory path containing the bundle files.
 *  @param  outputMode     (string, optional) Determines how keys are exposed: 'vars' (JS variables/functions) or 'map' (key-value map).
 *  @param  useCache       (boolean, optional) Specifies if browser caching should be enabled for bundles. Default is false (forces reload).
 *  @param  fileEncoding   (string, optional) The character encoding for requesting bundle files. Default is 'UTF-8' for compatibility, though .properties are often ISO-8859-1.
 *  @param  onComplete     (function, optional) A callback function executed after all processing is finished.
 */
jQ.globalMessages.initStrings = function(configOptions) {

    // Configure the operational parameters.
    var defaultSettings = {
        bundleName:    'Messages',
        localeCode:    '',
        resourcePath:  '',
        outputMode:    'vars',
        useCache:      false,
        fileEncoding:  'UTF-8',
        onComplete:    null
    };
    configOptions = jQ.extend(defaultSettings, configOptions);

    if (configOptions.localeCode === null || configOptions.localeCode === '') {
        configOptions.localeCode = jQ.globalMessages.getBrowserLocale();
    }
    if (configOptions.localeCode === null) {
        configOptions.localeCode = '';
    }

    // Retrieve and process the specified bundle files.
    var bundleFiles = normalizeFileNames(configOptions.bundleName);
    for (var idx = 0; idx < bundleFiles.length; idx++) {
        // Step 1: Load the base bundle file (e.g., Messages.properties).
        fetchAndProcessFile(configOptions.resourcePath + bundleFiles[idx] + '.properties', configOptions);

        // Step 2: Load the language-specific bundle (e.g., Messages_fr.properties).
        if (configOptions.localeCode.length >= 2) {
            fetchAndProcessFile(configOptions.resourcePath + bundleFiles[idx] + '_' + configOptions.localeCode.substring(0, 2) + '.properties', configOptions);
        }

        // Step 3: Load the country-specific bundle (e.g., Messages_fr_CA.properties).
        if (configOptions.localeCode.length >= 5) {
            fetchAndProcessFile(configOptions.resourcePath + bundleFiles[idx] + '_' + configOptions.localeCode.substring(0, 5) + '.properties', configOptions);
        }
    }

    // Execute the completion callback if provided.
    if (configOptions.onComplete) {
        configOptions.onComplete();
    }
};


/*
 *  Provides access to localized values by their key, especially when 'outputMode' is 'map'.
 *  For instance: jQ.globalMessages.getMessage('app.menu.item_add')
 */
jQ.globalMessages.getMessage = function(messageKey /* Additional values for placeholders can follow */) {
    var messageValue = jQ.globalMessages.keyStore[messageKey];
    if (messageValue === null) {
        return '[' + messageKey + ']';
    }

    var placeholderValues;
    if (arguments.length === 2 && jQ.isArray(arguments[1])) {
        // If a single array is passed as the second argument, treat it as the list of placeholder values.
        placeholderValues = arguments[1];
    }

    // Process placeholder replacements.
    /*
     *  Tested scenarios:
     *    text.msg1=hello ''{0}'' world
     *    text.msg2=val '{0}' '{1}'{1}'end
     *    text.msg3=This is \"a string" 'a''{0}''s'd{fgh{ij'
     *    text.msg4="'''{'0}''" {0}{a}
     *    text.msg5="'''{0}'''" {1}
     *    text.msg6=A {1} B {0} C
     *    text.msg7=A 'quoted \\ s\ttringy' \t\t X
     *
     *  Expected outputs:
     *    text.msg1, p1         ==> hello 'p1' world
     *    text.msg2, p1         ==> val {0} {1}{1}end
     *    text.msg3, p1         ==> This is "a string" a'{0}'sd{fgh{ij
     *    text.msg4, p1         ==> "'{0}'" p1{a}
     *    text.msg5, p1         ==> "'{0}'" {1}
     *    text.msg6, p1         ==> A {1} B p1 C
     *    text.msg6, p1, p2     ==> A p2 B p1 C
     *    text.msg6, p1, p2, p3 ==> A p2 B p1 C
     *    text.msg7             ==> A quoted \ s	tringy 		 X
     */

    var currentIdx;
    if (typeof(messageValue) === 'string') {
        // Handle escape sequences. This is done before tokenizing because escapes are active within quoted segments.
        currentIdx = 0;
        while ((currentIdx = messageValue.indexOf('\\', currentIdx)) !== -1) {
            if (messageValue.charAt(currentIdx + 1) === 't') {
                messageValue = messageValue.substring(0, currentIdx) + '\t' + messageValue.substring((currentIdx++) + 2); // Tab character
            } else if (messageValue.charAt(currentIdx + 1) === 'r') {
                messageValue = messageValue.substring(0, currentIdx) + '\r' + messageValue.substring((currentIdx++) + 2); // Carriage return
            } else if (messageValue.charAt(currentIdx + 1) === 'n') {
                messageValue = messageValue.substring(0, currentIdx) + '\n' + messageValue.substring((currentIdx++) + 2); // Line feed
            } else if (messageValue.charAt(currentIdx + 1) === 'f') {
                messageValue = messageValue.substring(0, currentIdx) + '\f' + messageValue.substring((currentIdx++) + 2); // Form feed
            } else if (messageValue.charAt(currentIdx + 1) === '\\') {
                messageValue = messageValue.substring(0, currentIdx) + '\\' + messageValue.substring((currentIdx++) + 2); // Backslash itself
            } else {
                messageValue = messageValue.substring(0, currentIdx) + messageValue.substring(currentIdx + 1); // Silently remove unsupported escape char
            }
        }

        // Convert the string into an array of tokens (strings and placeholder indices).
        var tokenArray = [], subIdx, placeholderIndex;
        currentIdx = 0;
        while (currentIdx < messageValue.length) {
            if (messageValue.charAt(currentIdx) === '\'') {
                // Process quoted strings.
                if (currentIdx === messageValue.length - 1) {
                    messageValue = messageValue.substring(0, currentIdx); // Trailing quote is silently removed.
                } else if (messageValue.charAt(currentIdx + 1) === '\'') {
                    messageValue = messageValue.substring(0, currentIdx) + messageValue.substring(++currentIdx); // Escaped single quote.
                } else {
                    // Actual quoted section.
                    subIdx = currentIdx + 2;
                    while ((subIdx = messageValue.indexOf('\'', subIdx)) !== -1) {
                        if (subIdx === messageValue.length - 1 || messageValue.charAt(subIdx + 1) !== '\'') {
                            // Found matching start and end quotes. Remove them and adjust the string.
                            messageValue = messageValue.substring(0, currentIdx) + messageValue.substring(currentIdx + 1, subIdx) + messageValue.substring(subIdx + 1);
                            currentIdx = subIdx - 1;
                            break;
                        } else {
                            // Found a double single quote (escaped within the quoted string), reduce to one.
                            messageValue = messageValue.substring(0, subIdx) + messageValue.substring(++subIdx);
                        }
                    }

                    if (subIdx === -1) {
                        // No closing quote found. Discard the opening quote.
                        messageValue = messageValue.substring(0, currentIdx) + messageValue.substring(currentIdx + 1);
                    }
                }
            } else if (messageValue.charAt(currentIdx) === '{') {
                // Start of an unquoted placeholder.
                subIdx = messageValue.indexOf('}', currentIdx + 1);
                if (subIdx === -1) {
                    currentIdx++; // No closing brace. Continue processing the rest of the line.
                } else {
                    // Parse the integer index within the braces.
                    placeholderIndex = parseInt(messageValue.substring(currentIdx + 1, subIdx), 10);
                    if (!isNaN(placeholderIndex) && placeholderIndex >= 0) {
                        // Add the preceding string segment (if not empty) to the token array.
                        var precedingText = messageValue.substring(0, currentIdx);
                        if (precedingText !== '') {
                            tokenArray.push(precedingText);
                        }
                        // Add the placeholder index to the token array.
                        tokenArray.push(placeholderIndex);
                        // Reset processing for the remainder of the message value.
                        currentIdx = 0;
                        messageValue = messageValue.substring(subIdx + 1);
                    } else {
                        currentIdx = subIdx + 1; // Invalid placeholder format. Keep as-is.
                    }
                }
            } else {
                currentIdx++;
            }
        }

        // Add any remaining non-empty string segment to the token array.
        if (messageValue !== '') {
            tokenArray.push(messageValue);
        }
        messageValue = tokenArray;

        // Store the processed array back into the keyStore for future use.
        jQ.globalMessages.keyStore[messageKey] = tokenArray;
    }

    if (messageValue.length === 0) {
        return '';
    }
    if (messageValue.length === 1 && typeof(messageValue[0]) === 'string') {
        return messageValue[0];
    }

    var finalString = '';
    for (currentIdx = 0; currentIdx < messageValue.length; currentIdx++) {
        if (typeof(messageValue[currentIdx]) === 'string') {
            finalString += messageValue[currentIdx];
        }
        // If it's a number (placeholder index).
        else if (placeholderValues && messageValue[currentIdx] < placeholderValues.length) {
            finalString += placeholderValues[messageValue[currentIdx]];
        } else if (!placeholderValues && (messageValue[currentIdx] + 1) < arguments.length) {
            finalString += arguments[messageValue[currentIdx] + 1];
        } else {
            finalString += '{' + messageValue[currentIdx] + '}'; // Placeholder without a value.
        }
    }

    return finalString;
};

// Determines the browser's reported language and returns a standardized locale string.
jQ.globalMessages.getBrowserLocale = function() {
    return standardizeLocale(navigator.language /* e.g., Chrome, Firefox */ || navigator.userLanguage /* e.g., Internet Explorer */);
};


// Fetches and processes a single .properties file via AJAX.
function fetchAndProcessFile(filePath, configOptions) {
    jQ.ajax({
        url:         filePath,
        async:       false,
        cache:       configOptions.useCache,
        contentType: 'text/plain;charset=' + configOptions.fileEncoding,
        dataType:    'text',
        success:     function(fileContent, requestStatus) {
            processFileData(fileContent, configOptions.outputMode);
        }
    });
}

// Parses the content of a .properties file.
function processFileData(fileContent, outputMethod) {
    var generatedCode = '';
    var lineEntries = fileContent.split(/\n/);
    var placeholderRegex = /(\{\d+\})/g;
    var replacementRegex = /\{(\d+)\}/g;
    var unicodeEscapeRegex = /(\\u.{4})/ig;

    for (var lineIdx = 0; lineIdx < lineEntries.length; lineIdx++) {
        lineEntries[lineIdx] = lineEntries[lineIdx].replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Trim whitespace
        if (lineEntries[lineIdx].length > 0 && lineEntries[lineIdx].match('^#') !== '#') { // Ignore comment lines
            var keyValue = lineEntries[lineIdx].split('=');
            if (keyValue.length > 0) {
                // Extract and process the key and value.
                var entryKey = unescape(keyValue[0]).replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Trim key
                var entryValue = keyValue.length === 1 ? '' : keyValue[1];

                // Handle multi-line values indicated by a trailing backslash.
                while (entryValue.match(/\\$/) === '\\') {
                    entryValue = entryValue.substring(0, entryValue.length - 1);
                    entryValue += lineEntries[++lineIdx].replace(/\s\s*$/, ''); // Append next line, right-trimmed.
                }

                // Re-assemble values if '=' was present within the value itself.
                for (var componentIdx = 2; componentIdx < keyValue.length; componentIdx++) {
                    entryValue += '=' + keyValue[componentIdx];
                }
                entryValue = entryValue.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Trim final value.

                // If output mode includes 'map', store keys in the global map.
                if (outputMethod === 'map' || outputMethod === 'both') {
                    // Decode unicode escape sequences (e.g., \u00e3).
                    var foundUnicodes = entryValue.match(unicodeEscapeRegex);
                    if (foundUnicodes) {
                        for (var uniIdx = 0; uniIdx < foundUnicodes.length; uniIdx++) {
                            entryValue = entryValue.replace(foundUnicodes[uniIdx], decodeUnicodeEscapes(foundUnicodes[uniIdx]));
                        }
                    }
                    // Add the processed key-value pair to the map.
                    jQ.globalMessages.keyStore[entryKey] = entryValue;
                }

                // If output mode includes 'vars', generate JavaScript variables/functions.
                if (outputMethod === 'vars' || outputMethod === 'both') {
                    entryValue = entryValue.replace(/"/g, '\\"'); // Escape double quotes.

                    // Ensure that any namespaced key (e.g., 'app.messages.welcome') has its parent objects created.
                    ensureKeyStructure(entryKey);

                    // If the value contains variable placeholders (e.g., {0}, {1}).
                    if (placeholderRegex.test(entryValue)) {
                        var valueParts = entryValue.split(placeholderRegex);
                        var isFirstArg = true;
                        var functionArgs = '';
                        var utilizedArgs = [];

                        for (var partIdx = 0; partIdx < valueParts.length; partIdx++) {
                            if (placeholderRegex.test(valueParts[partIdx]) && (utilizedArgs.length === 0 || utilizedArgs.indexOf(valueParts[partIdx]) === -1)) {
                                if (!isFirstArg) {
                                    functionArgs += ',';
                                }
                                functionArgs += valueParts[partIdx].replace(replacementRegex, 'arg$1');
                                utilizedArgs.push(valueParts[partIdx]);
                                isFirstArg = false;
                            }
                        }
                        generatedCode += entryKey + '=function(' + functionArgs + '){';
                        var functionBody = '"' + entryValue.replace(replacementRegex, '"+arg$1+"') + '"';
                        generatedCode += 'return ' + functionBody + ';' + '};';

                    } else {
                        // Simple string value without placeholders.
                        generatedCode += entryKey + '="' + entryValue + '";';
                    }
                } // END: outputMethod 'vars' or 'both'
            } // END: if(keyValue.length > 0)
        } // END: skip comments
    }
    eval(generatedCode); // Execute the generated JavaScript code to define variables/functions.
}

// Ensures that all parent objects in a dot-separated key path (e.g., 'app.messages.greeting') exist.
// NOTE: Key segments that begin with numbers might cause issues. Example: 'month.short.1=January'.
function ensureKeyStructure(fullKey) {
    var dotSeparatorRegex = /\./;
    if (dotSeparatorRegex.test(fullKey)) {
        var currentNamespace = '';
        var namespaceParts = fullKey.split(/\./);
        for (var partIdx = 0; partIdx < namespaceParts.length; partIdx++) {
            if (partIdx > 0) {
                currentNamespace += '.';
            }
            currentNamespace += namespaceParts[partIdx];
            if (eval('typeof ' + currentNamespace + ' === "undefined"')) {
                eval(currentNamespace + '={};');
            }
        }
    }
}

// Ensures that the provided file name(s) are always returned as an array.
function normalizeFileNames(inputNames) {
    return (inputNames && inputNames.constructor === Array) ? inputNames : [inputNames];
}

// Adjusts the given locale code to a standard format (e.g., 'en_US').
function standardizeLocale(inputLocale) {
    inputLocale = inputLocale.toLowerCase();
    if (inputLocale.length > 3) {
        inputLocale = inputLocale.substring(0, 3) + inputLocale.substring(3).toUpperCase();
    }
    return inputLocale;
}

// Decodes unicode escape sequences (e.g., '\u00e3') within a string.
function decodeUnicodeEscapes(inputString) {
    // Process unicode code points.
    var charCodeList = [];
    var currentCode = parseInt(inputString.substring(2), 16);
    if (currentCode >= 0 && currentCode < Math.pow(2, 16)) {
        charCodeList.push(currentCode);
    }
    // Convert numerical codes back into characters.
    var decodedString = '';
    for (var charIdx = 0; charIdx < charCodeList.length; ++charIdx) {
        decodedString += String.fromCharCode(charCodeList[charIdx]);
    }
    return decodedString;
}

/*
 *  Cross-Browser String Split Utility (Version 1.0.1)
 *  Copyright (c) Steven Levithan <stevenlevithan.com>; MIT License.
 *  Provides an ECMA-compliant, consistent string split function across various browsers.
 */
var crossBrowserSplitter;

// Prevent re-initialization, which would break the reference to the original `split` method.
if (!crossBrowserSplitter) {
    crossBrowserSplitter = function(sourceString, delimiterPattern, maxSplits) {
        // If the delimiter is not a regular expression, use the native `split` implementation.
        if (Object.prototype.toString.call(delimiterPattern) !== '[object RegExp]') {
            if (typeof crossBrowserSplitter._originalSplit === 'undefined') {
                return sourceString.split(delimiterPattern, maxSplits);
            } else {
                return crossBrowserSplitter._originalSplit.call(sourceString, delimiterPattern, maxSplits);
            }
        }

        var resultParts = [],
            lastProcessedPosition = 0,
            regexFlags = (delimiterPattern.ignoreCase ? 'i' : '') +
                         (delimiterPattern.multiline  ? 'm' : '') +
                         (delimiterPattern.sticky     ? 'y' : ''),
            // Create a global regex copy to manage `lastIndex` reliably.
            delimiterPattern = RegExp(delimiterPattern.source, regexFlags + 'g'),
            tempDelimiter, regexMatch, matchEndIndex, lastMatchLength;

        sourceString = sourceString + ''; // Ensure string type.
        if (!crossBrowserSplitter._supportsNonParticipatingCapturingGroups) {
            tempDelimiter = RegExp('^' + delimiterPattern.source + '$(?!\\s)', regexFlags); // No need for 'g' or 'y'.
        }

        /*
         *  Behavior for `maxSplits` parameter:
         *  - `undefined`: No limit.
         *  - `NaN` or zero: Returns an empty array.
         *  - Positive number: Uses `Math.floor(maxSplits)`.
         *  - Negative number: No limit.
         *  - Other types: Type-converted, then follows the above rules.
         */
        if (maxSplits === undefined || +maxSplits < 0) {
            maxSplits = Infinity;
        } else {
            maxSplits = Math.floor(+maxSplits);
            if (!maxSplits) {
                return [];
            }
        }

        while (regexMatch = delimiterPattern.exec(sourceString)) {
            matchEndIndex = regexMatch.index + regexMatch[0].length; // `delimiterPattern.lastIndex` can be inconsistent.

            if (matchEndIndex > lastProcessedPosition) {
                resultParts.push(sourceString.slice(lastProcessedPosition, regexMatch.index));

                // Correct for browsers where `exec` doesn't consistently return `undefined` for non-participating groups.
                if (!crossBrowserSplitter._supportsNonParticipatingCapturingGroups && regexMatch.length > 1) {
                    regexMatch[0].replace(tempDelimiter, function() {
                        for (var loopVar = 1; loopVar < arguments.length - 2; loopVar++) {
                            if (arguments[loopVar] === undefined) {
                                regexMatch[loopVar] = undefined;
                            }
                        }
                    });
                }

                if (regexMatch.length > 1 && regexMatch.index < sourceString.length) {
                    Array.prototype.push.apply(resultParts, regexMatch.slice(1));
                }

                lastMatchLength = regexMatch[0].length;
                lastProcessedPosition = matchEndIndex;

                if (resultParts.length >= maxSplits) {
                    break;
                }
            }

            if (delimiterPattern.lastIndex === regexMatch.index) {
                delimiterPattern.lastIndex++; // Prevent infinite loops on zero-width matches.
            }
        }

        if (lastProcessedPosition === sourceString.length) {
            if (lastMatchLength || !delimiterPattern.test('')) {
                resultParts.push('');
            }
        } else {
            resultParts.push(sourceString.slice(lastProcessedPosition));
        }

        return resultParts.length > maxSplits ? resultParts.slice(0, maxSplits) : resultParts;
    };

    // Detect support for Non-Participating Capturing Groups (NPCG).
    crossBrowserSplitter._supportsNonParticipatingCapturingGroups = /()??/.exec('')[1] === undefined;
    crossBrowserSplitter._originalSplit = String.prototype.split;
}

// Override the native String.prototype.split with the cross-browser version.
String.prototype.split = function(delimiterPattern, maxSplits) {
    return crossBrowserSplitter(this, delimiterPattern, maxSplits);
};

})(jQuery);