(function(dependency) {
    const localizationService = {}; // New top-level namespace, replacing `$.i18n`

    // Internal storage for all localized messages, replacing `$.i18n.map`
    const messageRegistry = new Map();

    // Default configuration for resource loading, replacing `defaults`
    const defaultSettings = {
        resourceName: 'Messages', // Replaces `name`
        locale: '',               // Replaces `language`
        resourcePath: '',         // Replaces `path`
        retrievalMethod: 'vars',  // Replaces `mode` ('vars', 'map', or 'both')
        shouldCache: false,       // Replaces `cache`
        textEncoding: 'UTF-8',    // Replaces `encoding`
        completionCallback: null  // Replaces `callback`
    };

    // Helper function to ensure resource names are arrays, replacing `getFiles`
    const resolveResourceNames = (input) => Array.isArray(input) ? input : [input];

    // Helper to normalize language codes (e.g., 'en-us' -> 'en_US'), replacing `normaliseLanguageCode`
    const standardizeLocaleCode = (language) => {
        if (!language) return '';
        language = language.toLowerCase();
        // Original logic: if length > 3, take first 3 chars, then uppercase remainder.
        // Example: 'en-us' -> 'en_us' -> 'en_US'
        if (language.length > 3 && language.includes('-')) {
            const parts = language.split('-');
            if (parts.length > 1) {
                return parts[0] + '_' + parts[1].toUpperCase();
            }
        }
        // Fallback for simple 'en' or 'en_US' already
        return language;
    };

    // Helper to detect and standardize browser language, replacing `$.i18n.browserLang`
    localizationService.detectUserLocale = () => {
        return standardizeLocaleCode(navigator.language || navigator.userLanguage);
    };

    // Helper to convert unicode escape sequences like \uXXXX, replacing `unescapeUnicode`
    const decodeUnicodeEscapes = (text) => {
        return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
    };

    // Helper to set properties on the global object for 'vars' mode, replacing `checkKeyNamespace` and `eval` logic
    const establishGlobalProperty = (fullKey, contentValue, isFunction = false, functionArgs = null, functionBody = null) => {
        const segments = fullKey.split('.');
        let currentScope = globalThis; // Using globalThis for broader compatibility

        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (typeof currentScope[segment] === 'undefined' || typeof currentScope[segment] !== 'object' || currentScope[segment] === null) {
                currentScope[segment] = {};
            }
            currentScope = currentScope[segment];
        }
        const finalSegment = segments[segments.length - 1];
        if (isFunction) {
            currentScope[finalSegment] = new Function(functionArgs, functionBody);
        } else {
            currentScope[finalSegment] = contentValue;
        }
    };

    // Parser for .properties file content, replacing `parseData`
    const interpretResourceContent = (rawData, currentSettings) => {
        const lines = rawData.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));

        const placeholderRegex = /(\{\d+\})/g;
        const replacementPlaceholderRegex = /\{(\d+)\}/g;

        let lineIndex = 0;
        while (lineIndex < lines.length) {
            let currentLine = lines[lineIndex].trim();
            const firstEquals = currentLine.indexOf('=');

            if (firstEquals === -1) {
                lineIndex++;
                continue;
            }

            let key = currentLine.substring(0, firstEquals).trim();
            let value = currentLine.substring(firstEquals + 1); // Do not trim value initially, multi-line logic does
            
            // Handle multi-line values ending with '\'
            while (value.endsWith('\\') && lineIndex + 1 < lines.length) {
                value = value.substring(0, value.length - 1); // Remove trailing backslash
                lineIndex++;
                value += lines[lineIndex].trimStart(); // Append next line, original only right-trimmed
            }
            value = value.trim(); // Now trim the final value

            key = decodeURIComponent(key); // Original uses unescape, decodeURIComponent is modern equivalent for URI components

            // Decode unicode escapes (\uXXXX)
            value = decodeUnicodeEscapes(value);

            // Store in messageRegistry for 'map' mode or 'both'
            if (currentSettings.retrievalMethod === 'map' || currentSettings.retrievalMethod === 'both') {
                messageRegistry.set(key, value);
            }

            // Set global variables/functions for 'vars' mode or 'both'
            if (currentSettings.retrievalMethod === 'vars' || currentSettings.retrievalMethod === 'both') {
                if (placeholderRegex.test(value)) {
                    // This is a function with placeholders
                    const parts = value.split(placeholderRegex);
                    const usedArgs = new Set();
                    let fnArgsList = [];
                    let fnBodyParts = ['return "'];

                    for (let i = 0; i < parts.length; i++) {
                        if (placeholderRegex.test(parts[i])) {
                            const argName = parts[i].replace(replacementPlaceholderRegex, 'v$1');
                            if (!usedArgs.has(argName)) {
                                fnArgsList.push(argName);
                                usedArgs.add(argName);
                            }
                            fnBodyParts.push('" + ' + argName + ' + "');
                        } else {
                            fnBodyParts.push(parts[i].replace(/"/g, '\\"')); // Escape quotes in literal parts
                        }
                    }
                    fnBodyParts.push('";');
                    establishGlobalProperty(key, null, true, fnArgsList.join(','), fnBodyParts.join(''));
                } else {
                    // Simple variable assignment
                    establishGlobalProperty(key, value);
                }
            }
            lineIndex++;
        }
    };

    // Function to fetch and process a single resource file, replacing `loadAndParseFile`
    const _fetchAndProcessFile = async (filePath, currentSettings) => {
        try {
            const response = await fetch(filePath, {
                cache: currentSettings.shouldCache ? 'default' : 'no-store', // 'no-store' for cache:false
                headers: {
                    'Content-Type': `text/plain;charset=${currentSettings.textEncoding}`
                }
            });
            if (!response.ok) {
                console.warn(`Failed to load resource: ${filePath} (Status: ${response.status})`);
                return;
            }
            const data = await response.text();
            interpretResourceContent(data, currentSettings);
        } catch (error) {
            console.error(`Error fetching resource ${filePath}:`, error);
        }
    };

    // Main function to load and parse resource bundles, replacing `$.i18n.properties`
    localizationService.loadResources = async (options) => {
        const currentOptions = { ...defaultSettings, ...options };

        if (!currentOptions.locale) {
            currentOptions.locale = localizationService.detectUserLocale();
        }
        if (!currentOptions.locale) {
            currentOptions.locale = ''; // Ensure it's not null/undefined
        }

        const baseNames = resolveResourceNames(currentOptions.resourceName);
        const fetchPromises = [];

        for (const name of baseNames) {
            const basePath = currentOptions.resourcePath ? `${currentOptions.resourcePath}/` : '';
            const baseFileName = `${basePath}${name}.properties`;
            fetchPromises.push(_fetchAndProcessFile(baseFileName, currentOptions));

            if (currentOptions.locale.length >= 2) {
                const langCode = currentOptions.locale.substring(0, 2);
                const langFileName = `${basePath}${name}_${langCode}.properties`;
                fetchPromises.push(_fetchAndProcessFile(langFileName, currentOptions));
            }

            if (currentOptions.locale.length >= 5) {
                const countryCode = currentOptions.locale.substring(0, 5);
                const countryFileName = `${basePath}${name}_${countryCode}.properties`;
                fetchPromises.push(_fetchAndProcessFile(countryFileName, currentOptions));
            }
        }

        await Promise.all(fetchPromises);

        if (currentOptions.completionCallback) {
            currentOptions.completionCallback();
        }
    };

    // Function to process a raw message value into an array of tokens (strings or numbers),
    // implementing a state-machine-like parsing for escapes, quotes, and placeholders.
    const tokenizeMessageValue = (rawMessage) => {
        const tokens = [];
        let buffer = ''; // Accumulates plain text
        let i = 0;

        const pushBuffer = () => {
            if (buffer.length > 0) {
                tokens.push(buffer);
                buffer = '';
            }
        };

        while (i < rawMessage.length) {
            const char = rawMessage[i];

            if (char === '\\') {
                pushBuffer();
                if (i + 1 < rawMessage.length) {
                    const nextChar = rawMessage[i+1];
                    switch (nextChar) {
                        case 't': tokens.push('\t'); i += 2; continue;
                        case 'r': tokens.push('\r'); i += 2; continue;
                        case 'n': tokens.push('\n'); i += 2; continue;
                        case 'f': tokens.push('\f'); i += 2; continue;
                        case '\\': tokens.push('\\'); i += 2; continue;
                        default: // Unknown escape: drop the backslash, keep the next character.
                            i++; // Skip the backslash. The `nextChar` will be `char` in the next iteration.
                            continue;
                    }
                } else { // Trailing backslash, treat as literal
                    buffer += char;
                    i++;
                    continue;
                }
            } else if (char === '\'') {
                pushBuffer();
                if (i + 1 < rawMessage.length && rawMessage[i+1] === '\'') {
                    // Escaped single quote: '' -> '
                    tokens.push("'");
                    i += 2;
                } else {
                    // Start of a quoted string: '...'
                    let quoteEnd = i + 1;
                    let foundEnd = false;
                    while (quoteEnd < rawMessage.length) {
                        quoteEnd = rawMessage.indexOf('\'', quoteEnd);
                        if (quoteEnd === -1) { // No closing quote found
                            break;
                        }
                        if (quoteEnd + 1 < rawMessage.length && rawMessage[quoteEnd + 1] === '\'') {
                            // Found '' inside quote, skip second quote, continue searching for true end
                            quoteEnd += 2;
                        } else {
                            // Found actual closing quote
                            foundEnd = true;
                            break;
                        }
                    }

                    if (foundEnd) {
                        let quotedContent = rawMessage.substring(i + 1, quoteEnd);
                        tokens.push(quotedContent.replace(/''/g, "'")); // Replace internal escaped quotes
                        i = quoteEnd + 1;
                    } else {
                        // Unclosed quote, treat rest of the string as literal, dropping initial quote
                        tokens.push(rawMessage.substring(i + 1));
                        i = rawMessage.length;
                    }
                }
            } else if (char === '{') {
                pushBuffer();
                let braceEnd = rawMessage.indexOf('}', i + 1);
                if (braceEnd !== -1) {
                    const content = rawMessage.substring(i + 1, braceEnd);
                    const num = parseInt(content, 10);
                    if (!isNaN(num) && num >= 0) {
                        tokens.push(num); // Valid placeholder index
                        i = braceEnd + 1;
                    } else {
                        // Invalid placeholder (e.g., {abc}), treat as literal
                        tokens.push(rawMessage.substring(i, braceEnd + 1));
                        i = braceEnd + 1;
                    }
                } else {
                    // Unclosed brace, treat rest of the string as literal
                    tokens.push(rawMessage.substring(i));
                    i = rawMessage.length;
                }
            } else {
                buffer += char;
                i++;
            }
        }
        pushBuffer(); // Add any remaining buffer content

        // Consolidate adjacent string tokens
        const consolidated = [];
        for (let k = 0; k < tokens.length; k++) {
            if (typeof tokens[k] === 'string' && typeof consolidated[consolidated.length - 1] === 'string') {
                consolidated[consolidated.length - 1] += tokens[k];
            } else if (tokens[k] !== '') { // Filter out empty strings
                consolidated.push(tokens[k]);
            }
        }
        return consolidated;
    };

    // Function to retrieve a message and perform substitutions, replacing `$.i18n.prop`
    localizationService.getMessage = (key, ...substitutions) => {
        let rawValue = messageRegistry.get(key);

        if (rawValue === undefined) {
            return `[${key}]`; // Return default format if key not found
        }

        // If the value is a string, it needs to be tokenized. Cache the tokenized version.
        if (typeof rawValue === 'string') {
            rawValue = tokenizeMessageValue(rawValue);
            messageRegistry.set(key, rawValue); // Store the tokenized array for future use
        }

        if (rawValue.length === 0) {
            return "";
        }
        if (rawValue.length === 1 && typeof rawValue[0] === "string") {
            return rawValue[0];
        }

        let assembledString = "";
        for (let i = 0; i < rawValue.length; i++) {
            const token = rawValue[i];
            if (typeof token === "string") {
                assembledString += token;
            } else if (typeof token === "number") { // It's a placeholder index
                if (token < substitutions.length) {
                    assembledString += substitutions[token];
                } else {
                    assembledString += `{${token}}`; // Placeholder not replaced
                }
            }
        }
        return assembledString;
    };

    // Expose the new localization service on the dependency object
    dependency.globalization = localizationService;

})(jQuery); // Assuming jQuery is passed as the dependency, renamed to `dep`