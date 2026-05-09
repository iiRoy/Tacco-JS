module.exports.processSettings = function (sourcePath, completionHandler) {
    require('fs').readFile(sourcePath, 'utf8', function (issue, settingsData) {
        if (issue) {
            return completionHandler(issue);
        }

        const processedResult = {
            alterations: [],
            directives: [],
            segments: [],
            secureHosts: []
        };

        let activeSegment;
        let activeDirectives;
        let shouldBypass = false;

        settingsData.split('\n').forEach(function (textLine) {
            // Trim leading/trailing whitespace from the current line
            textLine = textLine.trim();

            // Process line if not empty and not a comment
            if (textLine && textLine.indexOf('#') !== 0) {
                // Check for section definition: [SectionName]
                if (textLine.startsWith('[') && textLine.endsWith(']')) {
                    const segmentIdentifier = textLine.slice(1, -1).trim();
                    // Determine if this section should be skipped (e.g., [#SkippedSection])
                    shouldBypass = segmentIdentifier.startsWith('#');
                    activeSegment = {
                        alterations: [],
                        directives: []
                    };
                    processedResult.segments.push(activeSegment);
                    activeDirectives = null; // Reset current directives context
                } else if (!shouldBypass) {
                    // Handle specific directives like SSL configuration
                    if (textLine.startsWith('$UseSSLFor ')) {
                        textLine.split(/\s+/).slice(1).forEach(function (tlsDomain) {
                            processedResult.secureHosts.push(tlsDomain);
                        });
                    }
                    // Handle general modifiers (e.g., $ModifierName Value)
                    else if (textLine.startsWith('$')) {
                        const adjustment = fabricateModifier(textLine.slice(1));
                        if (adjustment) {
                            if (activeDirectives) {
                                activeDirectives.forEach(function (directive) {
                                    directive.alterations.push(adjustment);
                                });
                            } else {
                                // Apply to current segment or global if no segment active
                                (activeSegment || processedResult).alterations.push(adjustment);
                            }
                        }
                    }
                    // Handle rewrite rules (e.g., /pattern/ => /replacement/)
                    else if (textLine.includes('=>')) {
                        const parts = textLine.split('=>').map(function (part) {
                            return part.trim();
                        });
                        const matchers = fabricateMatchers(parts[0]);
                        activeDirectives = [];
                        matchers.forEach(function (matcher) {
                            const instructionObj = {
                                criterion: matcher,
                                operation: fabricateOperation(matcher.resourceUri || matcher.uriPrefix, parts[1]),
                                alterations: []
                            };
                            activeDirectives.push(instructionObj);
                            (activeSegment || processedResult).directives.push(instructionObj);
                        });
                    }
                }
            }
        });
        completionHandler(null, processedResult);
    });
};


function fabricateMatchers(originText) {
    // Regular expression pattern matching
    if (originText.startsWith('/') && originText.endsWith('/')) {
        return [{
            resourceUri: new RegExp(originText.substring(1, originText.length - 1), 'i')
        }];
    }
    // Exact URL matching (prefix with '!')
    else if (originText.startsWith('!')) {
        return standardizeUri(originText.slice(1)).map(function (webAddress) {
            return {
                resourceUri: webAddress
            };
        });
    }
    // URL prefix matching
    else {
        return standardizeUri(originText).map(function (webAddress) {
            return {
                uriPrefix: webAddress
            };
        });
    }
}


function standardizeUri(webAddress) {
    let webAddresses = [webAddress];
    // If no protocol specified, try both http and https
    if (!/^https?:\/\//.test(webAddress)) {
        webAddresses = ['http://' + webAddress, 'https://' + webAddress];
    }
    return webAddresses.map(function (currentWebAddress) {
        // Using url.parse and url.format to handle internationalized domain names (IDN)
        const URL_UTIL = require('url');
        let regularizedWebAddress = URL_UTIL.format(URL_UTIL.parse(currentWebAddress));
        // Remove trailing slash if present, unless it's the root path
        if (currentWebAddress.lastIndexOf('/') !== currentWebAddress.length - 1) {
            regularizedWebAddress = regularizedWebAddress.replace(/\/$/, '');
        }
        return regularizedWebAddress;
    });
}


function fabricateOperation(criterion, substitute) {
    if (substitute === '$') {
        return fabricateDefaultOperation();
    } else if (substitute === '') {
        return generateCancellationHandler();
    } else if (substitute.match(/^data:(?:([a-zA-Z/-]+);)?(base64,)?(.*)/)) {
        // Data URI handling
        return fabricateDataOperation(criterion, RegExp.$3 || '', RegExp.$1 || 'text/plain', !!RegExp.$2);
    } else if (substitute.startsWith('file://')) {
        return generateFileHandler(criterion, substitute.slice(7));
    } else if (substitute.startsWith('proxy:')) {
        return generateProxyHandler(substitute.slice(6).trim());
    } else if (substitute.startsWith('bin:')) {
        return generateCommandExecutor(criterion, substitute.slice(4).trim());
    } else {
        return generateUrlRewriter(criterion, substitute);
    }
}


function fabricateDefaultOperation() {
    return function (processorState) {
        processorState.executeRequest();
    };
}


function generateCancellationHandler() {
    return function (processorState) {
        processorState.haltProcessing();
    };
}


function fabricateDataOperation(criterion, patternText, mediaType, isBinaryEncoded) {
    return function (processorState) {
        let payload = patternText;
        if (!isBinaryEncoded) {
            payload = renderPattern(patternText, processorState, criterion);
        }
        // Use Buffer.from instead of new Buffer for modern Node.js
        payload = Buffer.from(payload, isBinaryEncoded ? 'base64' : 'utf8');
        processorState.setResponseMediaType(mediaType);
        processorState.sendResponseContent(payload);
    };
}


function generateFileHandler(criterion, pathTemplate) {
    return function (processorState) {
        let templateString = pathTemplate;
        // If criterion is a simple string, append remaining URL path
        if (typeof criterion === 'string') {
            templateString = require('path').join(templateString, processorState.getRequestUri().slice(criterion.length));
        }
        // Resolve file name, stripping query parameters
        let resolvedPath = renderPattern(templateString, processorState, criterion).split('?')[0];
        // Replace '~' with document root
        resolvedPath = resolvedPath.replace(/~/g, processorState.retrieve('documentRoot', ''));
        processorState.sendLocalFile(resolvedPath);
    };
}


function generateProxyHandler(proxyConfiguration) {
    let connectionProxy;
    // Parse proxy details if provided and formatted correctly
    if (proxyConfiguration && proxyConfiguration.match(/^(?:([^:]*):([^@]*)@)?([^:]*):([0-9]*)$/)) {
        connectionProxy = {
            userName: RegExp.$1,
            secretCode: RegExp.$2,
            targetHost: RegExp.$3,
            targetPort: RegExp.$4
        };
    }
    return function (processorState) {
        processorState.setConnectionProxy(connectionProxy);
        processorState.executeRequest();
    };
}


function generateCommandExecutor(criterion, scriptTemplate) {
    return function (processorState) {
        const executableCommand = renderPattern(scriptTemplate, processorState, criterion);
        require('child_process').exec(executableCommand, {
            encoding: 'binary',
            maxBuffer: 1024 * 1024
        }, function (issue, cmdOutput, cmdError) {
            if (issue) {
                return processorState.reportError(issue);
            }
            processorState.sendResponseContent(cmdOutput || cmdError);
        });
    };
}


function generateUrlRewriter(criterion, destinationTemplate) {
    return function (processorState) {
        let webAddress = renderPattern(destinationTemplate, processorState, criterion);
        // Ensure URL has a protocol if missing
        webAddress = webAddress.replace(/^(?!https?:\/\/)/, processorState.getRequestProtocol() + '//');
        // If criterion is a simple string, append remaining URL path
        if (typeof criterion === 'string') {
            webAddress += processorState.getRequestUri().slice(criterion.length);
        }
        processorState.setRequestUri(webAddress);
        processorState.executeRequest();
    };
}


function renderPattern(templateString, processorState, criterion) {
    let substitutions = [];
    // If criterion is a RegExp, capture groups are arguments
    if (typeof criterion !== 'string') {
        substitutions = processorState.getRequestUri().match(criterion);
    }
    return templateString.replace(/(?:(~)|\$(?:(\d+)|\{(&)?([^}]+)\}))/g, function (fullMatch, documentRootFlag, captureGroupIndex, encodingRequired, placeholderIdentifier) {
        if (documentRootFlag) {
            return processorState.retrieve('documentRoot');
        } else if (captureGroupIndex) {
            return substitutions[captureGroupIndex] || '';
        } else {
            let resultValue = '';
            const accessorFunction = {
                uri: 'getRequestUri',
                host: 'getRequestHost',
                port: 'getRequestPort',
                path: 'getRequestPath',
                query: 'getQueryString'
            }[placeholderIdentifier];

            if (accessorFunction) {
                resultValue = processorState[accessorFunction]();
            } else if (placeholderIdentifier.startsWith('header:')) {
                resultValue = processorState.getRequestHeaderValue(placeholderIdentifier.slice(7));
            } else if (placeholderIdentifier.startsWith('param:')) {
                resultValue = processorState.getQueryParameter(placeholderIdentifier.slice(6));
            } else if (placeholderIdentifier.startsWith('cookie:')) {
                resultValue = processorState.getCookieValue(placeholderIdentifier.slice(7));
            }

            if (encodingRequired) {
                resultValue = encodeURIComponent(resultValue);
            }
            return resultValue;
        }
    });
}


function fabricateModifier(directiveInstruction) {
    const instructionParams = directiveInstruction.split(/\s+/);
    const directiveName = instructionParams.shift();
    // Convert directive name to camelCase method name
    const handlerMethod = directiveName[0].toLowerCase() + directiveName.slice(1);
    const directiveValue = instructionParams.join(' ');

    // Handle modifiers that set key-value pairs
    if (/^(SetRequestHeader|SetResponseHeader|SetQueryParam|SetCookie)$/.test(directiveName)) {
        let valueSeparator = ':';
        if (directiveName === 'SetQueryParam' || directiveName === 'SetCookie') {
            valueSeparator = '=';
        }
        const settingArguments = directiveValue.split(valueSeparator);
        const parameterName = settingArguments.shift().trim();
        const parameterValue = settingArguments.join(valueSeparator).trim();
        return function (processorState) {
            processorState[handlerMethod](parameterName, renderPattern(parameterValue, processorState, ''));
        };
    }

    // Handle modifiers that remove items by name
    if (/^(RemoveRequestHeader|RemoveResponseHeader|RemoveQueryParam|RemoveCookie)$/.test(directiveName)) {
        return function (processorState) {
            processorState[handlerMethod](directiveValue);
        };
    }

    // Handle StatusCode modifier
    if (directiveName === 'StatusCode') {
        const httpStatusCode = Number(directiveValue); // Explicit number conversion
        if (httpStatusCode) {
            return function (processorState) {
                processorState.overrideResponseStatus(httpStatusCode);
            };
        }
    }

    // Handle Delay modifier
    if (directiveName === 'Delay') {
        const waitPeriod = Number(directiveValue); // Explicit number conversion
        if (waitPeriod) {
            return function (processorState) {
                processorState.store('delay', waitPeriod);
            };
        }
    }

    // Handle SetDocumentRoot modifier
    if (directiveName === 'SetDocumentRoot') {
        const baseDirectory = directiveValue;
        return function (processorState) {
            processorState.store('documentRoot', renderPattern(baseDirectory, processorState, ''));
        };
    }

    // Log unknown modifiers
    console.log('Unrecognized directive: ' + directiveName);
}