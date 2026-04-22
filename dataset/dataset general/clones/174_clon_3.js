export const processConfigurationFile = function(targetFilePath, completionCallback) {
    // A mapping for file system operations.
    const fileSystemOps = require('fs');
    // A utility for URL parsing and formatting.
    const uriUtilities = require('url');
    // For path manipulation.
    const pathUtilities = require('path');
    // For executing shell commands.
    const subprocessUtilities = require('child_process');

    fileSystemOps.readFile(targetFilePath, { encoding: 'utf8' }, function(errorEncountered, fileContents) {
        if (errorEncountered) {
            // An issue occurred during file reading, propagate the error.
            return completionCallback(errorEncountered);
        }

        // Initialize a structured object to hold all parsed configuration elements.
        const parsedConfigurationData = {
            globalModifiers: [], // Modifiers applicable to all rules.
            allRules: [],      // All defined rules across sections.
            definedSections: [], // Distinct configuration sections.
            secureHosts: []    // List of hosts requiring SSL.
        };

        // Reference to the currently active configuration section being populated.
        let activeConfigurationSection = null;
        // Reference to the most recently defined ruleset within the current section or globally.
        let recentlyDefinedRuleset = null;
        // Flag to indicate if the current section or block of rules should be ignored.
        let shouldSkipProcessing = false;

        // Helper function to process individual lines.
        const processInputLine = (inputString) => {
            const processedLine = inputString.trim();
            // Ignore empty lines or lines starting with a comment character.
            if (!processedLine || processedLine.startsWith('#')) {
                return;
            }

            // Check if the line defines a new section, e.g., "[SectionName]".
            if (processedLine.startsWith('[') && processedLine.endsWith(']')) {
                const sectionIdentifier = processedLine.substring(1, processedLine.length - 1).trim();
                // A section starting with '#' indicates it should be skipped.
                shouldSkipProcessing = sectionIdentifier.startsWith('#');

                activeConfigurationSection = {
                    sectionModifiers: [], // Modifiers specific to this section.
                    sectionRules: []      // Rules specific to this section.
                };
                parsedConfigurationData.definedSections.push(activeConfigurationSection);
                recentlyDefinedRuleset = null; // Reset ruleset context for a new section.
            } else if (!shouldSkipProcessing) {
                // Process lines within active, non-skipped sections.

                // Handle special directive for SSL hosts: "$UseSSLFor host1 host2 ..."
                if (processedLine.startsWith('$UseSSLFor ')) {
                    // Extract hosts by splitting the line and skipping the directive itself.
                    processedLine.split(/\s+/).slice(1).forEach(hostEntry => {
                        parsedConfigurationData.secureHosts.push(hostEntry);
                    });
                }
                // Handle general modifiers: "$ModifierName argument"
                else if (processedLine.startsWith('$')) {
                    const modifierInstance = generateActionModifier(processedLine.substring(1));
                    if (modifierInstance) {
                        if (recentlyDefinedRuleset && recentlyDefinedRuleset.length > 0) {
                            // Apply modifier to the most recently defined rules.
                            recentlyDefinedRuleset.forEach(ruleItem => {
                                ruleItem.ruleModifiers.push(modifierInstance);
                            });
                        } else {
                            // Apply modifier to the current section or globally if no section is active.
                            const targetContainer = activeConfigurationSection || parsedConfigurationData;
                            targetContainer.globalModifiers.push(modifierInstance);
                        }
                    }
                }
                // Handle mapping rules: "pattern => replacement"
                else if (processedLine.includes('=>')) {
                    const parts = processedLine.split('=>').map(segment => segment.trim());
                    const sourcePatternString = parts[0];
                    const targetReplacementString = parts[1];

                    const generatedPatterns = produceMatchPatterns(sourcePatternString);
                    recentlyDefinedRuleset = []; // Initialize a new ruleset for these patterns.

                    generatedPatterns.forEach(patternDefinition => {
                        const newRule = {
                            matchingPattern: patternDefinition,
                            actionDirective: composeDirectiveHandler(
                                patternDefinition.url || patternDefinition.urlStart,
                                targetReplacementString
                            ),
                            ruleModifiers: [] // Modifiers for this specific rule.
                        };
                        recentlyDefinedRuleset.push(newRule);
                        // Add rule to the current section or globally.
                        const targetContainer = activeConfigurationSection || parsedConfigurationData;
                        targetContainer.allRules.push(newRule);
                    });
                }
                // Unknown line type, could log or throw an error, but as per Type III, we can omit non-essential error logs.
            }
        };

        // Process each line from the configuration file.
        for (const currentLineText of fileContents.split('\n')) {
            processInputLine(currentLineText);
        }

        // Successfully parsed the configuration.
        completionCallback(null, parsedConfigurationData);
    });

    /**
     * Generates an array of pattern objects based on the source string.
     * Supports regular expressions, exact URL matches, and URL prefixes.
     * @param {string} patternSourceString The string defining the pattern.
     * @returns {Array<Object>} An array of pattern objects.
     */
    function produceMatchPatterns(patternSourceString) {
        if (!patternSourceString) {
            return [];
        }

        // Regular expression pattern: /regex/
        if (patternSourceString.startsWith('/') && patternSourceString.endsWith('/')) {
            try {
                const regexContent = patternSourceString.substring(1, patternSourceString.length - 1);
                return [{
                    url: new RegExp(regexContent, 'i') // Case-insensitive regex.
                }];
            } catch (e) {
                // Invalid regex, return an empty array or handle error.
                return [];
            }
        }
        // Exact URL match: !http://example.com
        else if (patternSourceString.startsWith('!')) {
            return standardizeUri(patternSourceString.substring(1)).map(normalizedUri => {
                return {
                    url: normalizedUri
                };
            });
        }
        // URL prefix match: http://example.com/prefix
        else {
            return standardizeUri(patternSourceString).map(normalizedUri => {
                return {
                    urlStart: normalizedUri
                };
            });
        }
    }

    /**
     * Standardizes a given URL string, potentially adding http/https prefixes.
     * Also converts internationalized domain names (IDN) to Punycode.
     * @param {string} inputUri The URL string to standardize.
     * @returns {Array<string>} An array of standardized URLs (e.g., http and https versions).
     */
    function standardizeUri(inputUri) {
        if (!inputUri) {
            return [];
        }

        let candidateUris = [inputUri];
        // If the URL doesn't start with http(s)://, prepend both.
        if (!/^https?:\/\//i.test(inputUri)) {
            candidateUris = [`http://${inputUri}`, `https://${inputUri}`];
        }

        return candidateUris.map(uriToProcess => {
            // Use URL parsing and formatting to handle IDN conversion (Punycode).
            let processedUri = uriUtilities.format(uriUtilities.parse(uriToProcess));

            // Ensure URLs without trailing slashes retain that property,
            // unless it's the root path (e.g. 'http://example.com/').
            if (uriToProcess.endsWith('/') && !processedUri.endsWith('/')) {
                // If original had a trailing slash but processed one lost it, add it back
                // (e.g., 'http://example.com/' might become 'http://example.com' after format).
                processedUri += '/';
            } else if (!uriToProcess.endsWith('/') && processedUri.endsWith('/') && processedUri !== 'http://' && processedUri !== 'https://') {
                // If original didn't have a trailing slash but processed one gained it, remove it.
                processedUri = processedUri.replace(/\/$/, '');
            }

            return processedUri;
        });
    }

    /**
     * Creates an action handler function based on the replacement string.
     * @param {string|RegExp} matchingCondition The pattern that triggered this action.
     * @param {string} actionInstruction The string defining the action (e.g., '$', '', 'data:', 'file:', etc.).
     * @returns {Function} An asynchronous function that performs the specified action.
     */
    function composeDirectiveHandler(matchingCondition, actionInstruction) {
        // Default action: pass through the request without modification.
        if (actionInstruction === '$') {
            return generatePassthroughAction();
        }
        // Abort action: stop the request.
        else if (actionInstruction === '') {
            return generateAbortRequestAction();
        }
        // Data URI action: 'data:[mediatype][;base64],data'
        else if (actionInstruction.startsWith('data:')) {
            // Regex to parse data URIs.
            const dataUriMatch = actionInstruction.match(/^data:(?:([a-zA-Z/-]+);)?(base64,)?(.*)/);
            if (dataUriMatch) {
                const [, mediaType, isBase64Encoded, dataContent] = dataUriMatch;
                return generateDataResponseAction(
                    matchingCondition,
                    dataContent || '',
                    mediaType || 'text/plain',
                    !!isBase64Encoded
                );
            }
        }
        // File action: 'file:///path/to/file'
        else if (actionInstruction.startsWith('file://')) {
            return generateFileServeAction(matchingCondition, actionInstruction.substring(7));
        }
        // Proxy action: 'proxy:user:pass@host:port'
        else if (actionInstruction.startsWith('proxy:')) {
            return generateProxyForwardAction(actionInstruction.substring(6).trim());
        }
        // Binary command action: 'bin:command_to_execute'
        else if (actionInstruction.startsWith('bin:')) {
            return generateBinaryExecutionAction(matchingCondition, actionInstruction.substring(4).trim());
        }
        // Standard URL rewrite action.
        else {
            return generateUrlRewriteAction(matchingCondition, actionInstruction);
        }
        // Fallback for unrecognized action instructions.
        return generateNoOpAction('Unrecognized action instruction: ' + actionInstruction);
    }

    /**
     * Creates a function that performs a no-operation (does nothing).
     * Useful for unhandled cases or placeholders.
     * @param {string} [message] An optional message for debugging.
     * @returns {Function} A no-op function.
     */
    function generateNoOpAction(message = 'No-operation action.') {
        return function(requestContext) {
            // console.warn('No-op action triggered:', message);
            requestContext.doRequest(); // Default to continuing the request if no specific action is defined.
        };
    }

    /**
     * Creates an action that simply continues the request.
     * @returns {Function} An action function.
     */
    function generatePassthroughAction() {
        return function(requestContext) {
            requestContext.doRequest();
        };
    }

    /**
     * Creates an action that aborts the current request.
     * @returns {Function} An action function.
     */
    function generateAbortRequestAction() {
        return function(requestContext) {
            requestContext.abort();
        };
    }

    /**
     * Creates an action that sends data as a response.
     * @param {string|RegExp} matchingCondition The pattern that matched.
     * @param {string} dataTemplate The data content template.
     * @param {string} mimeType The MIME type of the data.
     * @param {boolean} isBase64Flag True if the data is base64 encoded.
     * @returns {Function} An action function.
     */
    function generateDataResponseAction(matchingCondition, dataTemplate, mimeType, isBase64Flag) {
        return function(requestContext) {
            let processedContent = dataTemplate;
            if (!isBase64Flag) {
                // Apply template variables if not base64.
                processedContent = processTemplateString(dataTemplate, requestContext, matchingCondition);
            }
            // Create a Buffer from the content.
            const responseBuffer = Buffer.from(processedContent, isBase64Flag ? 'base64' : 'utf8');
            requestContext.setResponseType(mimeType);
            requestContext.send(responseBuffer);
        };
    }

    /**
     * Creates an action that serves a file from the local filesystem.
     * @param {string|RegExp} matchingCondition The pattern that matched.
     * @param {string} filePathTemplate The template for the file path.
     * @returns {Function} An action function.
     */
    function generateFileServeAction(matchingCondition, filePathTemplate) {
        return function(requestContext) {
            let resolvedPath = filePathTemplate;
            if (typeof matchingCondition === 'string') {
                // If a string pattern, append the remaining URL path.
                const requestUrl = requestContext.getRequestUrl();
                const pathSuffix = requestUrl.substring(matchingCondition.length);
                resolvedPath = pathUtilities.join(resolvedPath, pathSuffix);
            }
            // Apply template variables to the file path.
            let finalFilePath = processTemplateString(resolvedPath, requestContext, matchingCondition);
            // Remove query parameters from the file path.
            finalFilePath = finalFilePath.split('?')[0];
            // Replace '~' with the document root.
            finalFilePath = finalFilePath.replace(/~/g, requestContext.get('documentRoot', ''));
            requestContext.sendFile(finalFilePath);
        };
    }

    /**
     * Creates an action that configures a proxy for the request.
     * @param {string} proxySpecification A string like 'user:pass@host:port'.
     * @returns {Function} An action function.
     */
    function generateProxyForwardAction(proxySpecification) {
        let proxySettings = null;
        // Parse proxy specification.
        const proxyMatch = proxySpecification.match(/^(?:([^:]*):([^@]*)@)?([^:]+):([0-9]+)$/);
        if (proxyMatch) {
            proxySettings = {
                username: proxyMatch[1],
                password: proxyMatch[2],
                hostname: proxyMatch[3],
                port: Number.parseInt(proxyMatch[4], 10)
            };
        }

        return function(requestContext) {
            if (proxySettings) {
                requestContext.setProxy(proxySettings);
            }
            requestContext.doRequest(); // Continue with the proxied request.
        };
    }

    /**
     * Creates an action that executes a shell command and sends its output as a response.
     * @param {string|RegExp} matchingCondition The pattern that matched.
     * @param {string} commandTemplate The shell command template string.
     * @returns {Function} An action function.
     */
    function generateBinaryExecutionAction(matchingCondition, commandTemplate) {
        return function(requestContext) {
            const finalCommand = processTemplateString(commandTemplate, requestContext, matchingCondition);
            subprocessUtilities.exec(finalCommand, { encoding: 'binary', maxBuffer: 1024 * 1024 }, (execError, stdOutput, stdError) => {
                if (execError) {
                    return requestContext.error(execError);
                }
                requestContext.send(stdOutput || stdError); // Send stdout or stderr if stdout is empty.
            });
        };
    }

    /**
     * Creates an action that rewrites the request URL.
     * @param {string|RegExp} matchingCondition The pattern that matched.
     * @param {string} targetUriTemplate The template for the new URL.
     * @returns {Function} An action function.
     */
    function generateUrlRewriteAction(matchingCondition, targetUriTemplate) {
        return function(requestContext) {
            let rewrittenUrl = processTemplateString(targetUriTemplate, requestContext, matchingCondition);

            // Ensure the rewritten URL has a protocol if it's missing.
            if (!rewrittenUrl.match(/^(https?|ftp):\/\//i)) {
                rewrittenUrl = requestContext.getRequestProtocol() + '//' + rewrittenUrl;
            }

            // If the original pattern was a string, append the remainder of the original URL.
            if (typeof matchingCondition === 'string') {
                const originalRequestUrl = requestContext.getRequestUrl();
                const pathSuffix = originalRequestUrl.substring(matchingCondition.length);
                rewrittenUrl += pathSuffix;
            }
            requestContext.setRequestUrl(rewrittenUrl);
            requestContext.doRequest();
        };
    }

    /**
     * Processes a template string, replacing placeholders with values from the request context.
     * Placeholders can be:
     * - `~`: Document root.
     * - `$N`: Nth capture group from a regex match.
     * - `${variableName}`: Predefined request properties (url, host, port, path, query).
     * - `${header:Header-Name}`: Request header.
     * - `${param:Query-Param-Name}`: Query parameter.
     * - `${cookie:Cookie-Name}`: Cookie value.
     * - `${&variableName}`: URL-encoded version of the variable.
     *
     * @param {string} templateString The string containing placeholders.
     * @param {Object} requestState The object representing the current request context.
     * @param {string|RegExp} matchingPattern The pattern that matched the request URL.
     * @returns {string} The processed string with placeholders replaced.
     */
    function processTemplateString(templateString, requestState, matchingPattern) {
        let regexCaptureGroups = [];
        // If the matching pattern was a RegExp, capture its groups.
        if (typeof matchingPattern !== 'string' && matchingPattern instanceof RegExp) {
            regexCaptureGroups = requestState.getRequestUrl().match(matchingPattern) || [];
        }

        // Regex to find placeholders: `~`, `$N`, `${&?variable}`.
        const placeholderRegex = /(?:(~)|\$(?:(\d+)|\{([&])?([^}]+)\}))/g;

        return templateString.replace(placeholderRegex, (fullMatch, tildeMatch, digitMatch, escapeFlag, variableKey) => {
            if (tildeMatch) {
                // `~` placeholder for document root.
                return requestState.get('documentRoot', '');
            } else if (digitMatch) {
                // `$N` placeholder for regex capture groups.
                const groupIndex = Number.parseInt(digitMatch, 10);
                return regexCaptureGroups[groupIndex] || '';
            } else if (variableKey) {
                // `${variableName}` placeholders.
                let resolvedValue = '';
                const requestPropertyMap = {
                    'url': 'getRequestUrl',
                    'host': 'getRequestHost',
                    'port': 'getRequestPort',
                    'path': 'getRequestPath',
                    'query': 'getQueryString'
                };

                const methodAccessor = requestPropertyMap[variableKey];
                if (methodAccessor && typeof requestState[methodAccessor] === 'function') {
                    resolvedValue = requestState[methodAccessor]();
                } else if (variableKey.startsWith('header:')) {
                    resolvedValue = requestState.getRequestHeader(variableKey.substring(7));
                } else if (variableKey.startsWith('param:')) {
                    resolvedValue = requestState.getQueryParam(variableKey.substring(6));
                } else if (variableKey.startsWith('cookie:')) {
                    resolvedValue = requestState.getCookie(variableKey.substring(7));
                }
                // Apply URL encoding if the '&' flag is present.
                if (escapeFlag === '&') {
                    resolvedValue = encodeURIComponent(resolvedValue);
                }
                return resolvedValue;
            }
            return fullMatch; // Return original if no match.
        });
    }

    /**
     * Builds a modifier function based on a command string.
     * @param {string} modifierCommandText The command string for the modifier.
     * @returns {Function|null} A function that applies the modifier, or null if the command is unrecognized.
     */
    function generateActionModifier(modifierCommandText) {
        const commandParts = modifierCommandText.split(/\s+/);
        const operationName = commandParts.shift(); // e.g., "SetRequestHeader"
        const operationArgument = commandParts.join(' '); // Remaining part is the argument.

        // Determine the method key for the state object.
        const targetMethodKey = operationName[0].toLowerCase() + operationName.substring(1);

        switch (operationName) {
            case 'SetRequestHeader':
            case 'SetResponseHeader':
            case 'SetQueryParam':
            case 'SetCookie': {
                const separatorChar = (operationName === 'SetQueryParam' || operationName === 'SetCookie') ? '=' : ':';
                const settingParts = operationArgument.split(separatorChar);
                const settingName = settingParts.shift().trim();
                const settingValueTemplate = settingParts.join(separatorChar).trim();
                return function(requestContext) {
                    const finalValue = processTemplateString(settingValueTemplate, requestContext, '');
                    requestContext[targetMethodKey](settingName, finalValue);
                };
            }
            case 'RemoveRequestHeader':
            case 'RemoveResponseHeader':
            case 'RemoveQueryParam':
            case 'RemoveCookie': {
                return function(requestContext) {
                    requestContext[targetMethodKey](operationArgument);
                };
            }
            case 'StatusCode': {
                const httpStatusCode = Number.parseInt(operationArgument, 10);
                if (Number.isInteger(httpStatusCode) && httpStatusCode >= 100 && httpStatusCode < 600) {
                    return function(requestContext) {
                        requestContext.overwriteResponseStatus(httpStatusCode);
                    };
                }
                break; // Fall through if invalid status code.
            }
            case 'Delay': {
                const delayMilliseconds = Number.parseInt(operationArgument, 10);
                if (Number.isInteger(delayMilliseconds) && delayMilliseconds >= 0) {
                    return function(requestContext) {
                        requestContext.set('delay', delayMilliseconds);
                    };
                }
                break; // Fall through if invalid delay.
            }
            case 'SetDocumentRoot': {
                const documentRootPath = operationArgument;
                return function(requestContext) {
                    requestContext.set('documentRoot', processTemplateString(documentRootPath, requestContext, ''));
                };
            }
            // No default case needed, as we explicitly return null for unrecognized commands.
        }

        // For unrecognized commands, return null.
        return null;
    }
};