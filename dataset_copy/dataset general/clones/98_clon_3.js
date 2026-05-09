(function(jq) {
// Core internationalization utilities for JavaScript applications.
// This module provides mechanisms to load and retrieve localized messages.

// Central storage for localized key-value pairs when operating in 'map' mode.
jq.localization = {};
jq.localization.messageMap = {};

/**
 * Initiates the message loading process from .properties files.
 * These files are expected to follow a naming convention:
 * <resourceName>.properties, <resourceName>_<languageCode>.properties,
 * or <resourceName>_<languageCode>_<countryCode>.properties.
 *
 * Example usage:
 * jq.localization.init({
 *   resourceName: ['CommonMessages', 'ValidationMessages'],
 *   locale:       'es_MX',
 *   bundlePath:   './i18n/'
 * });
 *
 * @param {object} configOptions - Configuration object for loading.
 * @param {string|string[]} configOptions.resourceName - Base name(s) of the property files (e.g., 'messages').
 * @param {string} configOptions.locale - Desired language and country code (e.g., 'en_US'). If omitted, browser's language is used.
 * @param {string} configOptions.bundlePath - Directory containing the property files.
 * @param {string} configOptions.mode - How messages are exposed: 'variables' for global vars, 'map' for a lookup object, 'both'.
 * @param {boolean} configOptions.enableCache - Whether to allow browser caching of bundle files. Defaults to false (no caching).
 * @param {string} configOptions.charset - Character encoding for the property files. Defaults to 'UTF-8'.
 * @param {function} configOptions.completionCallback - Function to execute after all bundles are loaded and processed.
 */
jq.localization.init = function(configOptions) {
    // Define standard configuration values
    var standardConfig = {
        resourceName:    'AppMessages',
        locale:          '',
        bundlePath:      '',
        mode:            'variables',
        enableCache:     false,
        charset:         'UTF-8',
        completionCallback: null
    };

    // Merge user-provided options with defaults
    var currentConfig = jq.extend(standardConfig, configOptions);

    // Determine the effective locale if not explicitly provided
    if (currentConfig.locale === null || currentConfig.locale.length === 0) {
       currentConfig.locale = jq.localization.getBrowserLocale();
    }
    // Ensure locale is not null after browser detection
    if (currentConfig.locale === null) {
        currentConfig.locale = '';
    }

    // Process each specified resource file
    var resourceFiles = ensureArray(currentConfig.resourceName);
    for (var idx = 0; idx < resourceFiles.length; idx++) {
        var baseFileName = resourceFiles[idx];

        // 1. Load the base resource file (e.g., AppMessages.properties)
        loadAndParseResource(currentConfig.bundlePath + baseFileName + '.properties', currentConfig);

        // 2. Load language-specific file (e.g., AppMessages_en.properties)
        if (currentConfig.locale.length >= 2) {
            var languagePart = currentConfig.locale.substring(0, 2);
            loadAndParseResource(currentConfig.bundlePath + baseFileName + '_' + languagePart + '.properties', currentConfig);
        }

        // 3. Load country-specific file (e.g., AppMessages_en_US.properties)
        if (currentConfig.locale.length >= 5) {
            var fullLocalePart = currentConfig.locale.substring(0, 5);
            loadAndParseResource(currentConfig.bundlePath + baseFileName + '_' + fullLocalePart + '.properties', currentConfig);
        }
    }

    // Execute the callback function if provided
    if (currentConfig.completionCallback) {
        currentConfig.completionCallback();
    }
};


/**
 * Retrieves a localized message using its key, supporting placeholder substitution.
 * This method is primarily used when the 'mode' is set to 'map'.
 *
 * Example: jq.localization.retrieve('greeting.message', 'John Doe', 'morning');
 * If 'greeting.message' is "Good {1}, {0}!", it will return "Good morning, John Doe!".
 *
 * @param {string} messageKey - The unique key for the message.
 * @param {...any} [placeholderValues] - Values to substitute into placeholders ({0}, {1}, etc.).
 * @returns {string} The localized and formatted message, or a placeholder if not found.
 */
jq.localization.retrieve = function(messageKey /* ...variable arguments for placeholders */) {
    var rawValue = jq.localization.messageMap[messageKey];
    if (rawValue === undefined || rawValue === null) {
        // Return key in brackets if no value is found
        return '[' + messageKey + ']';
    }

    // Determine the list of placeholder values from arguments
    var substitutionData;
    if (arguments.length === 2 && Array.isArray(arguments[1])) {
        // If the second argument is an array, assume it's the list of values
        substitutionData = arguments[1];
    } else {
        // Otherwise, collect all arguments after the key as placeholder values
        substitutionData = Array.prototype.slice.call(arguments, 1);
    }

    // Perform escape character processing and tokenization if the value is a string.
    // This is a one-time process; the result is cached as an array of tokens.
    if (typeof rawValue === 'string') {
        var processedString = rawValue;
        var charIndex = 0;

        // Handle common escape sequences: \t, \r, \n, \f, \\
        while ((charIndex = processedString.indexOf('\\', charIndex)) !== -1) {
            var nextChar = processedString.charAt(charIndex + 1);
            var replacement = '';
            switch (nextChar) {
                case 't': replacement = '\t'; break;
                case 'r': replacement = '\r'; break;
                case 'n': replacement = '\n'; break;
                case 'f': replacement = '\f'; break;
                case '\\': replacement = '\\'; break;
                default:
                    // If not a recognized escape, remove the backslash
                    processedString = processedString.substring(0, charIndex) + processedString.substring(charIndex + 1);
                    continue; // Re-evaluate at the same index
            }
            processedString = processedString.substring(0, charIndex) + replacement + processedString.substring(charIndex + 2);
            charIndex += replacement.length; // Advance index by the length of the replacement
        }

        // Tokenize the string by quotes and placeholders
        var tokenList = [];
        charIndex = 0;
        var currentSegment = '';

        while (charIndex < processedString.length) {
            var char = processedString.charAt(charIndex);

            if (char === '\'') { // Handle quoted sections
                // Check for escaped quote '' -> '
                if (charIndex + 1 < processedString.length && processedString.charAt(charIndex + 1) === '\'') {
                    currentSegment += '\'';
                    charIndex += 2; // Skip both quotes
                } else {
                    // Start of a quoted string. Find the end.
                    var endQuoteIndex = processedString.indexOf('\'', charIndex + 1);
                    if (endQuoteIndex === -1) { // No closing quote, treat as literal
                        currentSegment += char;
                        charIndex++;
                    } else {
                        // Extract the quoted content
                        currentSegment += processedString.substring(charIndex + 1, endQuoteIndex);
                        charIndex = endQuoteIndex + 1; // Move past the closing quote
                    }
                }
            } else if (char === '{') { // Handle placeholder
                var closingBraceIndex = processedString.indexOf('}', charIndex + 1);
                if (closingBraceIndex === -1) { // No closing brace, treat as literal
                    currentSegment += char;
                    charIndex++;
                } else {
                    var placeholderText = processedString.substring(charIndex + 1, closingBraceIndex);
                    var placeholderIndex = parseInt(placeholderText, 10);

                    if (!isNaN(placeholderIndex) && placeholderIndex >= 0) {
                        // Valid placeholder, push current segment and index
                        if (currentSegment.length > 0) {
                            tokenList.push(currentSegment);
                        }
                        tokenList.push(placeholderIndex);
                        currentSegment = ''; // Reset segment
                        charIndex = closingBraceIndex + 1; // Move past closing brace
                    } else {
                        // Not a valid numeric placeholder, treat as literal
                        currentSegment += char;
                        charIndex++;
                    }
                }
            } else {
                currentSegment += char;
                charIndex++;
            }
        }

        // Add any remaining segment to the token list
        if (currentSegment.length > 0) {
            tokenList.push(currentSegment);
        }

        // Cache the tokenized array for future use
        rawValue = tokenList;
        jq.localization.messageMap[messageKey] = tokenList;
    }

    if (rawValue.length === 0) {
        return '';
    }
    if (rawValue.length === 1 && typeof rawValue[0] === 'string') {
        return rawValue[0];
    }

    var finalMessage = '';
    for (var tokenIdx = 0; tokenIdx < rawValue.length; tokenIdx++) {
        var currentToken = rawValue[tokenIdx];
        if (typeof currentToken === 'string') {
            finalMessage += currentToken;
        } else if (typeof currentToken === 'number') { // It's a placeholder index
            if (substitutionData && currentToken < substitutionData.length) {
                finalMessage += substitutionData[currentToken];
            } else {
                finalMessage += '{' + currentToken + '}'; // Placeholder not found, keep as is
            }
        }
    }

    return finalMessage;
};

/**
 * Determines the user's preferred language from the browser, normalized.
 * @returns {string} Normalized language code (e.g., 'en_US').
 */
jq.localization.getBrowserLocale = function() {
    var detectedLanguage = navigator.language || navigator.userLanguage || '';
    return standardizeLocaleCode(detectedLanguage);
};


/**
 * Performs an AJAX request to load and then parse a properties file.
 * @param {string} filePath - The full path to the .properties file.
 * @param {object} currentSettings - The current configuration settings.
 */
function loadAndParseResource(filePath, currentSettings) {
    if (!filePath) {
        console.warn("Attempted to load resource with empty path.");
        return;
    }

    jq.ajax({
        url:        filePath,
        async:      false, // Synchronous request to ensure bundles are loaded before proceeding
        cache:      currentSettings.enableCache,
        contentType: 'text/plain;charset=' + currentSettings.charset,
        dataType:   'text',
        success:    function(fileContent) {
            processResourceContent(fileContent, currentSettings.mode);
        },
        error: function(xhr, status, error) {
            // Log a warning if a file fails to load, but don't stop execution
            console.warn("Failed to load localization file: " + filePath + " (" + status + ": " + error + ")");
        }
    });
}

/**
 * Parses the raw content of a .properties file and integrates messages.
 * @param {string} rawTextData - The content of the .properties file.
 * @param {string} processingMode - 'variables', 'map', or 'both'.
 */
function processResourceContent(rawTextData, processingMode) {
    var generatedScript = ''; // Accumulates JS code for 'variables' mode
    var lineSeparator = /\r?\n/; // Handles both Windows and Unix line endings
    var lines = rawTextData.split(lineSeparator);
    var placeholderRegex = /(\{\d+\})/g; // Matches {0}, {1} etc.
    var replacePlaceholderRegex = /\{(\d+)\}/g; // For replacement within function bodies
    var unicodeEscapeRegex = /(\\u[0-9a-fA-F]{4})/g; // Matches \uXXXX unicode escapes

    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        var currentLine = lines[lineIdx].trim(); // Trim leading/trailing whitespace

        if (currentLine.length === 0 || currentLine.startsWith('#') || currentLine.startsWith('!')) {
            continue; // Skip empty lines and comment lines
        }

        var equalsIndex = currentLine.indexOf('=');
        if (equalsIndex === -1) {
            // Lines without an equals sign are ignored as invalid key-value pairs
            continue;
        }

        var key = currentLine.substring(0, equalsIndex).trim();
        var value = currentLine.substring(equalsIndex + 1);

        // Handle multi-line values indicated by a trailing backslash
        while (value.endsWith('\\') && lineIdx + 1 < lines.length) {
            value = value.substring(0, value.length - 1); // Remove trailing backslash
            value += lines[++lineIdx].trimStart(); // Append next line, trimming only leading space
        }
        value = value.trim(); // Final trim after multi-line assembly

        // --- Process for 'map' or 'both' modes ---
        if (processingMode === 'map' || processingMode === 'both') {
            // Decode unicode escape sequences (\uXXXX)
            var unicodeMatches = value.match(unicodeEscapeRegex);
            if (unicodeMatches) {
                for (var u = 0; u < unicodeMatches.length; u++) {
                    value = value.replace(unicodeMatches[u], decodeUnicodeChar(unicodeMatches[u]));
                }
            }
            jq.localization.messageMap[key] = value;
        }

        // --- Process for 'variables' or 'both' modes ---
        if (processingMode === 'variables' || processingMode === 'both') {
            var escapedValue = value.replace(/"/g, '\\"'); // Escape double quotes for JS string literal

            // Ensure JavaScript namespace exists for dotted keys (e.g., 'app.title')
            establishKeyNamespace(key);

            if (placeholderRegex.test(escapedValue)) {
                // If value contains placeholders, create a function
                var parts = escapedValue.split(placeholderRegex);
                var funcArgs = [];
                var seenArgs = new Set(); // Use Set for unique argument tracking

                for (var p = 0; p < parts.length; p++) {
                    if (placeholderRegex.test(parts[p])) {
                        var argName = parts[p].replace(replacePlaceholderRegex, 'arg$1');
                        if (!seenArgs.has(argName)) {
                            funcArgs.push(argName);
                            seenArgs.add(argName);
                        }
                    }
                }

                var funcBody = '"' + escapedValue.replace(replacePlaceholderRegex, '"+arg$1+"') + '"';
                generatedScript += key + '=function(' + funcArgs.join(',') + '){ return ' + funcBody + '; };\n';
            } else {
                // Simple value, create a variable
                generatedScript += key + '="' + escapedValue + '";\n';
            }
        }
    }
    // Execute the generated JavaScript for 'variables' mode
    if (generatedScript.length > 0) {
        try {
            eval(generatedScript);
        } catch (e) {
            console.error("Error evaluating generated script for localization variables:", e);
            console.error("Generated script:\n", generatedScript);
        }
    }
}

/**
 * Creates nested objects for dotted keys (e.g., 'app.title' -> app = {}, app.title = {}).
 * This function currently doesn't handle numeric parts in keys gracefully (e.g., 'list.item.0').
 * @param {string} fullKey - The key string (e.g., 'my.app.message').
 */
function establishKeyNamespace(fullKey) {
    var dotDelimiter = /\./;
    if (dotDelimiter.test(fullKey)) {
        var currentPath = '';
        var keySegments = fullKey.split(dotDelimiter);
        for (var segIdx = 0; segIdx < keySegments.length; segIdx++) {
            if (segIdx > 0) {
                currentPath += '.';
            }
            currentPath += keySegments[segIdx];
            // Check if the current segment path exists as an object
            // If not, create an empty object.
            try {
                if (typeof eval(currentPath) === "undefined") {
                    eval(currentPath + '={};');
                }
            } catch (e) {
                // Handle cases where eval might fail, e.g., if a segment is a number
                // For simplicity, we create it directly on the global/window scope if possible
                // or just ignore if it's an invalid JS identifier.
                // In a browser context, `window` is the global object.
                var parts = currentPath.split('.');
                var currentObj = window; // Assuming global scope for top-level keys
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
                        // Skip if segment is not a valid JS identifier (e.g., '0' as a key part)
                        break;
                    }
                    if (i < parts.length - 1 && typeof currentObj[part] === 'undefined') {
                        currentObj[part] = {};
                    }
                    currentObj = currentObj[part];
                }
            }
        }
    }
}

/**
 * Ensures the input `names` is always an array.
 * @param {string|string[]} names - A single name or an array of names.
 * @returns {string[]} An array of names.
 */
function ensureArray(names) {
    return (names && Array.isArray(names)) ? names : [names];
}

/**
 * Normalizes a language code to the format `ll_CC` (e.g., 'en_US').
 * Converts language part to lowercase and country part to uppercase.
 * @param {string} inputLangCode - The language code to normalize.
 * @returns {string} The normalized language code.
 */
function standardizeLocaleCode(inputLangCode) {
    var normalized = String(inputLangCode || '').toLowerCase(); // Ensure it's a string and lowercase

    if (normalized.length > 3) {
        // Assuming format like 'en-US' or 'en_us'
        var parts = normalized.split(/[-_]/);
        if (parts.length > 1) {
            normalized = parts[0] + '_' + parts[1].toUpperCase();
        } else {
            // Fallback for codes like 'pt_br' where only language is lowercase
            normalized = normalized.substring(0, 3) + normalized.substring(3).toUpperCase();
        }
    }
    return normalized;
}

/**
 * Converts a Unicode escape sequence (e.g., '\u00e3') into its corresponding character.
 * @param {string} unicodeEscapeSeq - The Unicode escape string.
 * @returns {string} The unescaped character.
 */
function decodeUnicodeChar(unicodeEscapeSeq) {
    if (!unicodeEscapeSeq || unicodeEscapeSeq.length !== 6 || !unicodeEscapeSeq.startsWith('\\u')) {
        return unicodeEscapeSeq; // Return as is if not a valid sequence
    }
    try {
        var charCode = parseInt(unicodeEscapeSeq.substring(2), 16);
        return String.fromCharCode(charCode);
    } catch (e) {
        console.warn("Invalid unicode escape sequence:", unicodeEscapeSeq, e);
        return unicodeEscapeSeq;
    }
}

/*
 * Cross-Browser String Split Utility (Modified)
 * Original: (c) Steven Levithan <stevenlevithan.com>; MIT License
 * Ensures consistent `split` behavior across different JavaScript environments,
 * especially regarding non-participating capturing groups and RegExp `lastIndex`.
 */
var crossBrowserSplitter;
// Initialize only once to avoid conflicts
if (!crossBrowserSplitter) {
  crossBrowserSplitter = function(inputStr, separatorPattern, limitCount) {
      // If the separator is not a RegExp, use the native split directly.
      // Store native split method reference to prevent recursion.
      if (Object.prototype.toString.call(separatorPattern) !== "[object RegExp]") {
        if(typeof crossBrowserSplitter._originalSplit === "undefined") {
          return inputStr.split(separatorPattern, limitCount);
        } else {
          return crossBrowserSplitter._originalSplit.call(inputStr, separatorPattern, limitCount);
        }
      }

      var resultSegments = [],
          lastProcessedIndex = 0,
          regexFlags = (separatorPattern.ignoreCase ? "i" : "") +
                       (separatorPattern.multiline  ? "m" : "") +
                       (separatorPattern.sticky     ? "y" : ""),
          // Create a new regex with 'g' flag to ensure `lastIndex` behaves predictably.
          activeSeparator = RegExp(separatorPattern.source, regexFlags + "g"),
          tempSeparator, currentMatch, matchEndIndex, matchLength;

      // Ensure input is a string
      inputStr = String(inputStr);

      // Special handling for non-participating capturing groups in older engines
      if (!crossBrowserSplitter._supportsNpcg) {
          tempSeparator = RegExp("^" + activeSeparator.source + "$(?!\\s)", regexFlags);
      }

      // Process the `limitCount` parameter
      if (limitCount === undefined || +limitCount < 0) {
          limitCount = Infinity;
      } else {
          limitCount = Math.floor(+limitCount);
          if (!limitCount) {
              return []; // Return empty array if limit is zero
          }
      }

      // Loop to find all matches of the separator
      while ((currentMatch = activeSeparator.exec(inputStr)) !== null) {
          matchEndIndex = currentMatch.index + currentMatch[0].length;

          if (matchEndIndex > lastProcessedIndex) {
              // Add the segment before the current match
              resultSegments.push(inputStr.slice(lastProcessedIndex, currentMatch.index));

              // Fix for browsers that don't consistently return `undefined` for empty capturing groups
              if (!crossBrowserSplitter._supportsNpcg && currentMatch.length > 1) {
                  currentMatch[0].replace(tempSeparator, function () {
                      for (var argIdx = 1; argIdx < arguments.length - 2; argIdx++) {
                          if (arguments[argIdx] === undefined) {
                              currentMatch[argIdx] = undefined;
                          }
                      }
                  });
              }

              // Add capturing group results, if any
              if (currentMatch.length > 1 && currentMatch.index < inputStr.length) {
                  Array.prototype.push.apply(resultSegments, currentMatch.slice(1));
              }

              matchLength = currentMatch[0].length;
              lastProcessedIndex = matchEndIndex;

              // Break if the limit is reached
              if (resultSegments.length >= limitCount) {
                  break;
              }
          }

          // Prevent infinite loops for zero-width matches
          if (activeSeparator.lastIndex === currentMatch.index) {
              activeSeparator.lastIndex++;
          }
      }

      // Add the remaining part of the string after the last separator
      if (lastProcessedIndex === inputStr.length) {
          if (matchLength > 0 || !activeSeparator.test("")) {
              resultSegments.push("");
          }
      } else {
          resultSegments.push(inputStr.slice(lastProcessedIndex));
      }

      // Trim the result array if it exceeds the limit
      return resultSegments.length > limitCount ? resultSegments.slice(0, limitCount) : resultSegments;
  };

  // Detect support for non-participating capturing groups
  crossBrowserSplitter._supportsNpcg = /()??/.exec("")[1] === undefined;
  // Store a reference to the native `String.prototype.split`
  crossBrowserSplitter._originalSplit = String.prototype.split;
}

// Override the native String.prototype.split with the cross-browser compliant version
String.prototype.split = function (sep, lim) {
    return crossBrowserSplitter(this, sep, lim);
};

})(jQuery);