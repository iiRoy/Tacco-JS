const fileSystem = require('fs');
const locatorUtil = require('url');
const pathUtility = require('path');
const processExecution = require('child_process');

module.exports.decodeConfiguration = function(filePath, completionHandler) {
    fileSystem.readFile(filePath, 'utf8', function(issue, sourceContent) {
        if (issue) {
            return completionHandler(issue);
        }

        const processedOutcome = {
            adjustments: [],
            directives: [],
            segments: [],
            securedEndpoints: []
        };

        const lines = sourceContent.split('\n');

        const finalState = lines.reduce((currentState, textRow) => {
            textRow = textRow.trim();

            if (!textRow || textRow.startsWith('#')) {
                return currentState;
            }

            if (textRow.startsWith('[') && textRow.endsWith(']')) {
                const segmentLabel = textRow.slice(1, -1).trim();
                currentState.bypassing = segmentLabel.startsWith('#');
                currentState.activeSegment = {
                    adjustments: [],
                    directives: []
                };
                currentState.processedOutcome.segments.push(currentState.activeSegment);
                currentState.activeDirectives = null;
            } else if (!currentState.bypassing) {
                if (textRow.startsWith('$UseSSLFor ')) {
                    textRow.split(/\s+/).slice(1).forEach(host => {
                        currentState.processedOutcome.securedEndpoints.push(host);
                    });
                } else if (textRow.startsWith('$')) {
                    const adjustment = fabricateAdjustment(textRow.slice(1));
                    if (adjustment) {
                        if (currentState.activeDirectives) {
                            currentState.activeDirectives.forEach(directive => {
                                directive.adjustments.push(adjustment);
                            });
                        } else {
                            (currentState.activeSegment || currentState.processedOutcome).adjustments.push(adjustment);
                        }
                    }
                } else if (textRow.includes('=>')) {
                    const instructionComponents = textRow.split('=>').map(component => component.trim());
                    const matchers = generateMatchers(instructionComponents[0]);
                    currentState.activeDirectives = [];
                    matchers.forEach(matcher => {
                        const directive = {
                            matcher: matcher,
                            operation: formulateOperation(matcher.resourceLocator || matcher.startResourceLocator, instructionComponents[1]),
                            adjustments: []
                        };
                        currentState.activeDirectives.push(directive);
                        (currentState.activeSegment || currentState.processedOutcome).directives.push(directive);
                    });
                }
            }
            return currentState;
        }, {
            processedOutcome: processedOutcome,
            activeSegment: null,
            activeDirectives: null,
            bypassing: false
        });

        completionHandler(null, finalState.processedOutcome);
    });
};

function generateMatchers(inputString) {
    if (inputString.startsWith('/') && inputString.endsWith('/')) {
        return [{
            resourceLocator: new RegExp(inputString.substring(1, inputString.length - 1), 'i')
        }];
    } else if (inputString.startsWith('!')) {
        return standardizeResourceLocator(inputString.slice(1)).map(resourceLocator => ({
            resourceLocator: resourceLocator
        }));
    } else {
        return standardizeResourceLocator(inputString).map(resourceLocator => ({
            startResourceLocator: resourceLocator
        }));
    }
}

function standardizeResourceLocator(resourceLocator) {
    let locatorsCollection = [resourceLocator];
    if (!/^https?:\/\//.test(resourceLocator)) {
        locatorsCollection = [`http://${resourceLocator}`, `https://${resourceLocator}`];
    }
    return locatorsCollection.map(currentLocator => {
        const parsedLocator = locatorUtil.parse(currentLocator);
        let standardizedLocator = locatorUtil.format(parsedLocator);
        if (currentLocator.lastIndexOf('/') !== currentLocator.length - 1) {
            standardizedLocator = standardizedLocator.replace(/\/$/, '');
        }
        return standardizedLocator;
    });
}

function formulateOperation(matcherIdentifier, substitution) {
    const operationFactories = {
        '$': assembleDefaultAction,
        '': assembleCancellationAction,
        'data:': (m, s) => {
            const dataMatch = s.match(/^data:(?:([a-zA-Z/-]+);)?(base64,)?(.*)/);
            if (dataMatch) {
                return assembleDataSupplyAction(m, dataMatch[3] || '', dataMatch[1] || 'text/plain', !!dataMatch[2]);
            }
            return null; // Indicate no match, will fall through to standard action
        },
        'file://': (m, s) => assembleFileUploadAction(m, s.slice(7)),
        'proxy:': (m, s) => assembleProxyRelayAction(s.slice(6).trim()),
        'bin:': (m, s) => assembleBinaryExecutionAction(m, s.slice(4).trim())
    };

    let operation = null;
    if (substitution === '$') operation = operationFactories['$']();
    else if (substitution === '') operation = operationFactories['']();
    else if (substitution.startsWith('data:')) operation = operationFactories['data:'](matcherIdentifier, substitution);
    else if (substitution.startsWith('file://')) operation = operationFactories['file://'](matcherIdentifier, substitution);
    else if (substitution.startsWith('proxy:')) operation = operationFactories['proxy:'](matcherIdentifier, substitution);
    else if (substitution.startsWith('bin:')) operation = operationFactories['bin:'](matcherIdentifier, substitution);

    if (operation !== null) {
        return operation;
    }

    return assembleStandardRequestAction(matcherIdentifier, substitution);
}

function assembleDefaultAction() {
    return function(runtimeContext) {
        runtimeContext.initiateRequest();
    };
}

function assembleCancellationAction() {
    return function(runtimeContext) {
        runtimeContext.terminate();
    };
}

function assembleDataSupplyAction(matcher, templateContent, mediaType, encodedAsBase64) {
    return function(runtimeContext) {
        let payloadContent = templateContent;
        if (!encodedAsBase64) {
            payloadContent = renderPlaceholderText(templateContent, runtimeContext, matcher);
        }
        payloadContent = Buffer.from(payloadContent, encodedAsBase64 ? 'base64' : 'utf8');
        runtimeContext.setResponseMediaType(mediaType);
        runtimeContext.transmit(payloadContent);
    };
}

function assembleFileUploadAction(matcher, filePathTemplate) {
    return function(runtimeContext) {
        let localTemplate = filePathTemplate;
        if (typeof matcher === 'string') {
            localTemplate = pathUtility.join(localTemplate, runtimeContext.retrieveRequestLocator().slice(matcher.length));
        }
        let resolvedFilePath = renderPlaceholderText(localTemplate, runtimeContext, matcher).split('?')[0];
        resolvedFilePath = resolvedFilePath.replace(/~/g, runtimeContext.fetch('baseDirectory', ''));
        runtimeContext.sendLocalFile(resolvedFilePath);
    };
}

function assembleProxyRelayAction(proxyConfiguration) {
    let proxyDetails;
    const match = proxyConfiguration.match(/^(?:([^:]*):([^@]*)@)?([^:]*):([0-9]*)$/);
    if (match) {
        proxyDetails = {
            account: match[1],
            secret: match[2],
            server: match[3],
            gatewayPort: match[4]
        };
    }
    return function(runtimeContext) {
        runtimeContext.setProxySettings(proxyDetails);
        runtimeContext.initiateRequest();
    };
}

function assembleBinaryExecutionAction(matcher, commandTemplate) {
    return function(runtimeContext) {
        const executionCommand = renderPlaceholderText(commandTemplate, runtimeContext, matcher);
        processExecution.exec(executionCommand, { encoding: 'binary', maxBuffer: 1024 * 1024 }, function(executionError, standardOutput, standardError) {
            if (executionError) {
                return runtimeContext.reportError(executionError);
            }
            runtimeContext.transmit(standardOutput || standardError);
        });
    };
}

function assembleStandardRequestAction(matcher, locatorTemplate) {
    return function(runtimeContext) {
        let processedLocator = renderPlaceholderText(locatorTemplate, runtimeContext, matcher);
        processedLocator = processedLocator.replace(/^(?!https?:\/\/)/, runtimeContext.getRequestScheme() + '//');
        if (typeof matcher === 'string') {
            processedLocator += runtimeContext.retrieveRequestLocator().slice(matcher.length);
        }
        runtimeContext.updateRequestLocator(processedLocator);
        runtimeContext.initiateRequest();
    };
}

function renderPlaceholderText(templateString, runtimeContext, matcher) {
    const segments = [];
    let lastIndex = 0;
    const templateRegex = /(~|\$(\d+)|\$\{(?:(&)?([^}]+))\})/g;

    let match;
    while ((match = templateRegex.exec(templateString)) !== null) {
        const [fullMatch, rootAlias, groupIndex, encodeFlag, variableName] = match;

        if (match.index > lastIndex) {
            segments.push(templateString.substring(lastIndex, match.index));
        }

        if (rootAlias) {
            segments.push(runtimeContext.fetch('baseDirectory'));
        } else if (groupIndex) {
            const captureGroups = (typeof matcher !== 'string' && runtimeContext.retrieveRequestLocator().match(matcher)) || [];
            segments.push(captureGroups[parseInt(groupIndex, 10)] || '');
        } else if (variableName) {
            let extractedValue = '';
            const contextMethodMap = {
                'locator': 'retrieveRequestLocator',
                'host': 'retrieveRequestHost',
                'port': 'retrieveRequestPort',
                'path': 'retrieveRequestPath',
                'query': 'retrieveQueryString'
            };

            if (contextMethodMap[variableName]) {
                extractedValue = runtimeContext[contextMethodMap[variableName]]();
            } else if (variableName.startsWith('header:')) {
                extractedValue = runtimeContext.getRequestHeaderValue(variableName.slice(7));
            } else if (variableName.startsWith('param:')) {
                extractedValue = runtimeContext.getQueryParameter(variableName.slice(6));
            } else if (variableName.startsWith('cookie:')) {
                extractedValue = runtimeContext.getCookieValue(variableName.slice(7));
            }

            if (encodeFlag) {
                extractedValue = encodeURIComponent(extractedValue);
            }
            segments.push(extractedValue);
        }
        lastIndex = templateRegex.lastIndex;
    }

    if (lastIndex < templateString.length) {
        segments.push(templateString.substring(lastIndex));
    }

    return segments.join('');
}

function fabricateAdjustment(instruction) {
    const instructionComponents = instruction.split(/\s+/);
    const instructionIdentifier = instructionComponents.shift();
    const behavioralMethod = instructionIdentifier[0].toLowerCase() + instructionIdentifier.slice(1);
    const instructionPayload = instructionComponents.join(' ');

    const adjustmentFactories = {
        'SetRequestHeader': (payload) => {
            const [settingKey, ...settingValueParts] = payload.split(':');
            const settingValue = settingValueParts.join(':').trim();
            return (runtimeContext) => runtimeContext[behavioralMethod](settingKey.trim(), renderPlaceholderText(settingValue, runtimeContext, ''));
        },
        'SetResponseHeader': (payload) => {
            const [settingKey, ...settingValueParts] = payload.split(':');
            const settingValue = settingValueParts.join(':').trim();
            return (runtimeContext) => runtimeContext[behavioralMethod](settingKey.trim(), renderPlaceholderText(settingValue, runtimeContext, ''));
        },
        'SetQueryParam': (payload) => {
            const [settingKey, ...settingValueParts] = payload.split('=');
            const settingValue = settingValueParts.join('=').trim();
            return (runtimeContext) => runtimeContext[behavioralMethod](settingKey.trim(), renderPlaceholderText(settingValue, runtimeContext, ''));
        },
        'SetCookie': (payload) => {
            const [settingKey, ...settingValueParts] = payload.split('=');
            const settingValue = settingValueParts.join('=').trim();
            return (runtimeContext) => runtimeContext[behavioralMethod](settingKey.trim(), renderPlaceholderText(settingValue, runtimeContext, ''));
        },
        'RemoveRequestHeader': (payload) => (runtimeContext) => runtimeContext[behavioralMethod](payload),
        'RemoveResponseHeader': (payload) => (runtimeContext) => runtimeContext[behavioralMethod](payload),
        'RemoveQueryParam': (payload) => (runtimeContext) => runtimeContext[behavioralMethod](payload),
        'RemoveCookie': (payload) => (runtimeContext) => runtimeContext[behavioralMethod](payload),
        'StatusCode': (payload) => {
            const statusIndicator = +payload;
            return statusIndicator ? (runtimeContext) => runtimeContext.alterResponseStatus(statusIndicator) : null;
        },
        'Delay': (payload) => {
            const delayDuration = +payload;
            return delayDuration ? (runtimeContext) => runtimeContext.assign('delay', delayDuration) : null;
        },
        'SetDocumentRoot': (payload) => {
            const baseDirectory = payload;
            return (runtimeContext) => runtimeContext.assign('baseDirectory', renderPlaceholderText(baseDirectory, runtimeContext, ''));
        }
    };

    const factory = adjustmentFactories[instructionIdentifier];
    if (factory) {
        return factory(instructionPayload);
    }

    console.log('Unknown adjustment ' + instructionIdentifier);
    return null;
}