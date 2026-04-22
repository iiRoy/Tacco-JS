(function() {
    var eventManagerHub = {},
        messageInterpreter = {},
        networkHandler = {},
        timeKeeper = {},
        configOptions = {},
        contentRefresher = {},
        liveUpdateEngine = {};

    var ElementEventDispatcher = (function() {
        var ieEventRegistry = new WeakMap();

        function attachEventHandler(domElement, eventIdentifier, actionCallback) {
            if (domElement.addEventListener) {
                domElement.addEventListener(eventIdentifier, actionCallback, false);
            } else if (domElement.attachEvent) {
                var elementEvents = ieEventRegistry.get(domElement);
                if (!elementEvents) {
                    elementEvents = {};
                    ieEventRegistry.set(domElement, elementEvents);
                }
                if (!elementEvents[eventIdentifier]) {
                    elementEvents[eventIdentifier] = 0;
                    domElement.attachEvent('onpropertychange', function(e) {
                        if (e.propertyName === eventIdentifier) {
                            var handlers = elementEvents[eventIdentifier + '_handlers'];
                            if (handlers) {
                                handlers.forEach(function(handler) {
                                    handler();
                                });
                            }
                        }
                    });
                }
                var handlers = elementEvents[eventIdentifier + '_handlers'];
                if (!handlers) {
                    handlers = [];
                    elementEvents[eventIdentifier + '_handlers'] = handlers;
                }
                handlers.push(actionCallback);
            } else {
                throw new Error("Cannot attach custom event '" + eventIdentifier + "' to non-DOM element.");
            }
        }

        function triggerEvent(domElement, eventIdentifier) {
            var evt;
            if (domElement.addEventListener) {
                evt = document.createEvent('HTMLEvents');
                evt.initEvent(eventIdentifier, true, true);
                return document.dispatchEvent(evt);
            } else if (domElement.attachEvent) {
                var elementEvents = ieEventRegistry.get(domElement);
                if (elementEvents && elementEvents[eventIdentifier] !== undefined) {
                    elementEvents[eventIdentifier]++;
                    return;
                }
            } else {
                throw new Error("Cannot trigger custom event '" + eventIdentifier + "' on non-DOM element.");
            }
        }

        return {
            addListener: attachEventHandler,
            dispatchSignal: triggerEvent
        };
    })();
    eventManagerHub.addListener = ElementEventDispatcher.addListener;
    eventManagerHub.dispatchSignal = ElementEventDispatcher.dispatchSignal;

    var ProtocolConstants = {
        PROTOCOL_V6: 'http://livereload.com/protocols/official-6',
        PROTOCOL_V7: 'http://livereload.com/protocols/official-7'
    };

    var ProtocolProcessingError = function(issue, rawData) {
        this.message = "LiveReload protocol processing error (" + issue + ") with data: \"" + rawData + "\".";
        this.name = "ProtocolProcessingError";
    };
    ProtocolProcessingError.prototype = Object.create(Error.prototype);
    ProtocolProcessingError.prototype.constructor = ProtocolProcessingError;

    var DataProcessor = (function() {
        function createProcessor(callbackHandlers) {
            var currentProtocol = null;
            var activeHandlers = callbackHandlers;

            function clearState() {
                currentProtocol = null;
            }

            function parseIncomingData(inputData) {
                var operation, payload, protocolMatch, parsedMsg;
                try {
                    if (currentProtocol === null) {
                        protocolMatch = inputData.match(/^!!ver:([\d.]+)$/);
                        if (protocolMatch) {
                            currentProtocol = 6;
                        } else {
                            parsedMsg = parseJsonMessage(inputData, ['hello']);
                            if (!parsedMsg.protocols || parsedMsg.protocols.length === 0) {
                                throw new ProtocolProcessingError("no protocol versions specified in handshake", inputData);
                            } else if (parsedMsg.protocols.includes(ProtocolConstants.PROTOCOL_V7)) {
                                currentProtocol = 7;
                            } else if (parsedMsg.protocols.includes(ProtocolConstants.PROTOCOL_V6)) {
                                currentProtocol = 6;
                            } else {
                                throw new ProtocolProcessingError("no supported protocol versions found", inputData);
                            }
                        }
                        return activeHandlers.connectionEstablished(currentProtocol);
                    } else if (currentProtocol === 6) {
                        parsedMsg = JSON.parse(inputData);
                        if (!Array.isArray(parsedMsg) || parsedMsg.length === 0) {
                            throw new ProtocolProcessingError("protocol v6 messages must be arrays", inputData);
                        }
                        operation = parsedMsg[0];
                        payload = parsedMsg[1];
                        if (operation !== 'refresh') {
                            throw new ProtocolProcessingError("unknown protocol v6 command '" + operation + "'", inputData);
                        }
                        return activeHandlers.incomingMessage({
                            command: 'reload',
                            path: payload.path,
                            liveCSS: (payload.apply_css_live != null ? payload.apply_css_live : true)
                        });
                    } else {
                        parsedMsg = parseJsonMessage(inputData, ['reload', 'alert']);
                        return activeHandlers.incomingMessage(parsedMsg);
                    }
                } catch (err) {
                    if (err instanceof ProtocolProcessingError) {
                        return activeHandlers.parsingError(err);
                    } else {
                        throw err;
                    }
                }
            }

            function parseJsonMessage(jsonData, permittedCommands) {
                var msg;
                try {
                    msg = JSON.parse(jsonData);
                } catch (e) {
                    throw new ProtocolProcessingError('invalid JSON format', jsonData);
                }
                if (!msg.command) {
                    throw new ProtocolProcessingError('missing "command" key', jsonData);
                }
                if (!permittedCommands.includes(msg.command)) {
                    throw new ProtocolProcessingError("unrecognized command '" + msg.command + "', only allowed: " + (permittedCommands.join(', ')), jsonData);
                }
                return msg;
            }

            return {
                resetState: clearState,
                processData: parseIncomingData
            };
        }
        return {
            create: createProcessor
        };
    })();
    messageInterpreter.ProtocolConstants = ProtocolConstants;
    messageInterpreter.ProtocolProcessingError = ProtocolProcessingError;
    messageInterpreter.DataProcessor = DataProcessor;

    var IntervalManager = (function() {
        function createManagedInterval(actionFunction) {
            var currentIntervalID = null;
            var isCurrentlyActive = false;
            var boundAction = function() {
                isCurrentlyActive = false;
                currentIntervalID = null;
                actionFunction();
            };

            return {
                begin: function(delayMs) {
                    if (isCurrentlyActive) {
                        clearTimeout(currentIntervalID);
                    }
                    currentIntervalID = setTimeout(boundAction, delayMs);
                    isCurrentlyActive = true;
                },
                halt: function() {
                    if (isCurrentlyActive) {
                        clearTimeout(currentIntervalID);
                        isCurrentlyActive = false;
                        currentIntervalID = null;
                    }
                },
                get isActive() {
                    return isCurrentlyActive;
                }
            };
        }

        function scheduleOneShot(delayMs, taskFunction) {
            return setTimeout(taskFunction, delayMs);
        }

        return {
            create: createManagedInterval,
            scheduleOnce: scheduleOneShot
        };
    })();
    timeKeeper.IntervalManager = IntervalManager;

    var ConfigurationSettings = (function() {
        var defaultSettings = {
            hostAddress: null,
            portNumber: 35729,
            snippetVersion: null,
            extensionName: null,
            extensionVersion: null,
            minReconnectDelay: 1000,
            maxReconnectDelay: 60000,
            handshakeTimeoutMs: 5000
        };

        function createSettingsObject() {
            var settings = {};
            for (var key in defaultSettings) {
                if (defaultSettings.hasOwnProperty(key)) {
                    settings[key] = defaultSettings[key];
                }
            }

            function adjustValue(propName, newValue) {
                if (settings[propName] === undefined) {
                    return;
                }
                if (typeof settings[propName] === 'number') {
                    settings[propName] = +newValue;
                } else {
                    settings[propName] = newValue;
                }
            }

            return {
                get: function(propName) {
                    return settings[propName];
                },
                set: adjustValue,
                getAll: function() {
                    return Object.assign({}, settings);
                }
            };
        }

        function discoverSettingsFromScripts(currentDocument) {
            var allScripts = currentDocument.querySelectorAll('script[src*="livereload.js"]');
            for (var i = 0; i < allScripts.length; i++) {
                var scriptElement = allScripts[i];
                var scriptSource = scriptElement.src;
                var matchResult = scriptSource.match(/^[^:]+:\/\/(.*)\/z?livereload\.js(?:\?(.*))?$/);

                if (matchResult) {
                    var discoveredSettings = createSettingsObject();
                    var hostAndPortPart = matchResult[1];
                    var queryParamsPart = matchResult[2];

                    var hostPortMatch = hostAndPortPart.match(/^([^\/:]+)(?::(\d+))?$/);
                    if (hostPortMatch) {
                        discoveredSettings.set('hostAddress', hostPortMatch[1]);
                        if (hostPortMatch[2]) {
                            discoveredSettings.set('portNumber', parseInt(hostPortMatch[2], 10));
                        }
                    }

                    if (queryParamsPart) {
                        queryParamsPart.split('&').forEach(function(paramPair) {
                            var parts = paramPair.split('=');
                            if (parts.length > 1) {
                                var normalizedKey = parts[0].replace(/-/g, '_');
                                var keyMap = {
                                    'host': 'hostAddress',
                                    'port': 'portNumber',
                                    'snipver': 'snippetVersion',
                                    'ext': 'extensionName',
                                    'extver': 'extensionVersion',
                                    'mindelay': 'minReconnectDelay',
                                    'maxdelay': 'maxReconnectDelay',
                                    'handshake_timeout': 'handshakeTimeoutMs'
                                };
                                if (keyMap[normalizedKey]) {
                                    discoveredSettings.set(keyMap[normalizedKey], parts.slice(1).join('='));
                                }
                            }
                        });
                    }
                    return discoveredSettings;
                }
            }
            return null;
        }

        return {
            create: createSettingsObject,
            extractFromDOM: discoverSettingsFromScripts
        };
    })();
    configOptions.ConfigurationSettings = ConfigurationSettings;

    var ConnectionManager = (function() {
        var ConnectionStates = {
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3
        };
        var LibraryVersion = '2.0.4';

        function createConnectionManager(configuration, WebSocketClass, IntervalUtility, connectionCallbacks) {
            var settings = configuration.getAll();
            var socketUri = "ws://" + settings.hostAddress + ":" + settings.portNumber + "/livereload";
            var currentReconnectDelay = settings.minReconnectDelay;
            var connectionIntent = false;
            var establishedProtocol = 0;
            var disconnectionReason = 'manual';

            var protocolProcessor = messageInterpreter.DataProcessor.create({
                connectionEstablished: function(protocol) {
                    establishedProtocol = protocol;
                    handshakeWatchdog.halt();
                    currentReconnectDelay = settings.minReconnectDelay;
                    disconnectionReason = 'broken';
                    connectionCallbacks.onConnected(protocol);
                },
                parsingError: function(err) {
                    connectionCallbacks.onError(err);
                    terminateConnectionWithError();
                },
                incomingMessage: function(msg) {
                    connectionCallbacks.onMessage(msg);
                }
            });

            var handshakeWatchdog = IntervalUtility.create(function() {
                if (!isSocketActive()) {
                    return;
                }
                disconnectionReason = 'handshake-timeout';
                currentSocket.close();
            });

            var reconnectionScheduler = IntervalUtility.create(function() {
                if (!connectionIntent) {
                    return;
                }
                initiateConnection();
            });

            var currentSocket = null;

            function isSocketActive() {
                return currentSocket && currentSocket.readyState === ConnectionStates.OPEN;
            }

            function initiateConnection() {
                connectionIntent = true;
                if (isSocketActive()) {
                    return;
                }
                reconnectionScheduler.halt();
                disconnectionReason = 'cannot-connect';
                protocolProcessor.resetState();
                connectionCallbacks.onConnecting();

                currentSocket = new WebSocketClass(socketUri);
                currentSocket.onopen = onSocketOpened;
                currentSocket.onclose = onSocketClosed;
                currentSocket.onmessage = onSocketMessage;
                currentSocket.onerror = onSocketError;
            }

            function terminateConnection() {
                connectionIntent = false;
                reconnectionScheduler.halt();
                if (!isSocketActive()) {
                    return;
                }
                disconnectionReason = 'manual';
                currentSocket.close();
            }

            function scheduleNextReconnection() {
                if (!connectionIntent) {
                    return;
                }
                if (!reconnectionScheduler.isActive) {
                    reconnectionScheduler.begin(currentReconnectDelay);
                    currentReconnectDelay = Math.min(settings.maxReconnectDelay, currentReconnectDelay * 2);
                }
            }

            function sendProtocolCommand(commandPayload) {
                if (establishedProtocol === 0) {
                    return;
                }
                currentSocket.send(JSON.stringify(commandPayload));
            }

            function terminateConnectionWithError() {
                handshakeWatchdog.halt();
                disconnectionReason = 'error';
                currentSocket.close();
            }

            function onSocketOpened(event) {
                connectionCallbacks.onSocketConnected();
                disconnectionReason = 'handshake-failed';
                var helloMessage = {
                    command: 'hello',
                    protocols: [messageInterpreter.ProtocolConstants.PROTOCOL_V6, messageInterpreter.ProtocolConstants.PROTOCOL_V7]
                };
                helloMessage.ver = LibraryVersion;
                if (settings.extensionName) {
                    helloMessage.ext = settings.extensionName;
                }
                if (settings.extensionVersion) {
                    helloMessage.extver = settings.extensionVersion;
                }
                if (settings.snippetVersion) {
                    helloMessage.snipver = settings.snippetVersion;
                }
                sendProtocolCommand(helloMessage);
                handshakeWatchdog.begin(settings.handshakeTimeoutMs);
            }

            function onSocketClosed(event) {
                establishedProtocol = 0;
                connectionCallbacks.onDisconnected(disconnectionReason, currentReconnectDelay);
                scheduleNextReconnection();
            }

            function onSocketError(event) {}

            function onSocketMessage(event) {
                protocolProcessor.processData(event.data);
            }

            initiateConnection();

            return {
                initiate: initiateConnection,
                terminate: terminateConnection,
                transmitCommand: sendProtocolCommand
            };
        }

        return {
            create: createConnectionManager
        };
    })();
    networkHandler.ConnectionManager = ConnectionManager;

    var StyleImageSelectors = [{
        property: 'background',
        styleProps: ['backgroundImage']
    }, {
        property: 'border',
        styleProps: ['borderImage', 'webkitBorderImage', 'MozBorderImage']
    }];

    var UrlPathTools = (function() {
        function splitUrlComponents(fullUrl) {
            var hashComponent, queryComponent, urlWithoutHashAndQuery;

            var hashIndex = fullUrl.indexOf('#');
            if (hashIndex >= 0) {
                hashComponent = fullUrl.slice(hashIndex);
                urlWithoutHashAndQuery = fullUrl.slice(0, hashIndex);
            } else {
                hashComponent = '';
                urlWithoutHashAndQuery = fullUrl;
            }

            var queryIndex = urlWithoutHashAndQuery.indexOf('?');
            if (queryIndex >= 0) {
                queryComponent = urlWithoutHashAndQuery.slice(queryIndex);
                urlWithoutHashAndQuery = urlWithoutHashAndQuery.slice(0, queryIndex);
            } else {
                queryComponent = '';
            }

            return {
                base: urlWithoutHashAndQuery,
                query: queryComponent,
                fragment: hashComponent
            };
        }

        function extractPathFromUrl(fullUrl) {
            var pathOnly;
            var components = splitUrlComponents(fullUrl);
            var baseUrl = components.base;

            if (baseUrl.startsWith('file://')) {
                pathOnly = baseUrl.replace(/^file:\/\/(localhost)?/, '');
            } else {
                pathOnly = baseUrl.replace(/^([^:]+:)?\/\/([^:\/]+)(:\d*)?\//, '/');
            }
            return decodeURIComponent(pathOnly);
        }

        function countMatchingSegments(pathA, pathB) {
            pathA = pathA.replace(/^\/+/, '').toLowerCase();
            pathB = pathB.replace(/^\/+/, '').toLowerCase();

            if (pathA === pathB) {
                return 10000;
            }

            var segmentsA = pathA.split('/').reverse();
            var segmentsB = pathB.split('/').reverse();
            var minLength = Math.min(segmentsA.length, segmentsB.length);
            var matchCount = 0;

            while (matchCount < minLength && segmentsA[matchCount] === segmentsB[matchCount]) {
                ++matchCount;
            }
            return matchCount;
        }

        function pathsAreSimilar(pathA, pathB) {
            return countMatchingSegments(pathA, pathB) > 0;
        }

        function findBestMatch(targetPath, items, pathExtractor) {
            var bestResult = {
                score: 0
            };
            for (var i = 0; i < items.length; i++) {
                var currentItem = items[i];
                var itemPath = pathExtractor(currentItem);
                var score = countMatchingSegments(targetPath, itemPath);
                if (score > bestResult.score) {
                    bestResult = {
                        item: currentItem,
                        score: score
                    };
                }
            }
            if (bestResult.score > 0) {
                return bestResult;
            } else {
                return null;
            }
        }

        return {
            decomposeUrl: splitUrlComponents,
            getPath: extractPathFromUrl,
            segmentScore: countMatchingSegments,
            arePathsRelated: pathsAreSimilar,
            findClosest: findBestMatch
        };
    })();

    var ContentUpdater = (function() {
        function createUpdater(targetWindow, consoleLogger, timerUtility) {
            var currentWindow = targetWindow;
            var currentDocument = targetWindow.document;
            var console = consoleLogger;
            var Timer = timerUtility;
            var stylesheetDelay = 200;
            var importCacheDelay = 200;
            var registeredPlugins = [];

            function registerExtension(pluginModule) {
                registeredPlugins.push(pluginModule);
            }

            function performUpdate(resourcePath, updateOptions) {
                for (var i = 0; i < registeredPlugins.length; i++) {
                    var plugin = registeredPlugins[i];
                    if (plugin.handleReload && plugin.handleReload(resourcePath, updateOptions)) {
                        return;
                    }
                }

                if (updateOptions.liveCSS && resourcePath.endsWith('.css')) {
                    if (refreshStylesheet(resourcePath)) {
                        return;
                    }
                }

                if (updateOptions.liveImg && resourcePath.match(/\.(jpe?g|png|gif)$/i)) {
                    refreshImages(resourcePath);
                    return;
                }

                reloadEntirePage();
            }

            function reloadEntirePage() {
                currentDocument.location.reload();
            }

            function generateUniqueId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            }

            function addCacheBuster(originalUrl, uniqueToken) {
                var components = UrlPathTools.decomposeUrl(originalUrl);
                var newQuery = components.query ? components.query + '&' : '?';
                newQuery += ('_livereload=' + uniqueToken);
                return components.base + newQuery + components.fragment;
            }

            function refreshImages(imagePath) {
                var uniqueToken = generateUniqueId();

                Array.from(currentDocument.images).forEach(function(imgElement) {
                    if (UrlPathTools.arePathsRelated(imagePath, UrlPathTools.getPath(imgElement.src))) {
                        imgElement.src = addCacheBuster(imgElement.src, uniqueToken);
                    }
                });

                if (currentDocument.querySelectorAll) {
                    StyleImageSelectors.forEach(function(selectorDef) {
                        var elementsWithStyle = currentDocument.querySelectorAll("[style*=" + selectorDef.property + "]");
                        Array.from(elementsWithStyle).forEach(function(element) {
                            updateStyleImages(element.style, selectorDef.styleProps, imagePath, uniqueToken);
                        });
                    });
                }
            }

            function updateStyleImages(elementStyle, styleProperties, imagePath, uniqueToken) {
                styleProperties.forEach(function(propName) {
                    var styleValue = elementStyle[propName];
                    if (styleValue && styleValue.includes('url(')) {
                        elementStyle[propName] = styleValue.replace(/url\((['"]?)(.*?)\1\)/g, function(match, quote, url) {
                            if (UrlPathTools.arePathsRelated(imagePath, UrlPathTools.getPath(url))) {
                                return 'url(' + quote + addCacheBuster(url, uniqueToken) + quote + ')';
                            }
                            return match;
                        });
                    }
                });
            }

            function getMatchingStylesheet(path) {
                var bestMatch = UrlPathTools.findClosest(path, Array.from(currentDocument.styleSheets), function(sheet) {
                    return sheet.href ? UrlPathTools.getPath(sheet.href) : null;
                });
                return bestMatch ? bestMatch.item : null;
            }

            function refreshStylesheet(path) {
                var matchingSheet = getMatchingStylesheet(path);
                var reloadedDirectLink = false;

                if (matchingSheet && matchingSheet.ownerNode.tagName === 'LINK') {
                    var newLinkElement = currentDocument.createElement('link');
                    newLinkElement.rel = 'stylesheet';
                    newLinkElement.media = matchingSheet.media;
                    newLinkElement.href = addCacheBuster(matchingSheet.href, generateUniqueId());
                    newLinkElement.onload = function() {
                        Timer.scheduleOnce(stylesheetDelay, function() {
                            matchingSheet.ownerNode.parentNode.removeChild(matchingSheet.ownerNode);
                        });
                    };
                    matchingSheet.ownerNode.parentNode.insertBefore(newLinkElement, matchingSheet.ownerNode.nextSibling);
                    reloadedDirectLink = true;
                }

                var hasReloadedImports = false;
                Array.from(currentDocument.styleSheets).forEach(function(sheet) {
                    var rulesToDelete = [];
                    var rules = Array.from(sheet.cssRules || sheet.rules);
                    for (var k = rules.length - 1; k >= 0; k--) {
                        var rule = rules[k];
                        if (rule.type === CSSRule.IMPORT_RULE && UrlPathTools.arePathsRelated(path, UrlPathTools.getPath(rule.href))) {
                            rulesToDelete.push({
                                sheet: sheet,
                                index: k,
                                url: rule.href
                            });
                        }
                    }

                    rulesToDelete.forEach(function(item) {
                        item.sheet.deleteRule(item.index);
                        var newImportLink = currentDocument.createElement('link');
                        newImportLink.rel = 'stylesheet';
                        newImportLink.href = addCacheBuster(item.url, generateUniqueId());
                        newImportLink.onload = newImportLink.onerror = function() {
                            Timer.scheduleOnce(importCacheDelay, function() {});
                        };
                        currentDocument.head.appendChild(newImportLink);
                        hasReloadedImports = true;
                    });
                });

                return reloadedDirectLink || hasReloadedImports;
            }

            return {
                registerPlugin: registerExtension,
                refreshContent: performUpdate,
                fullPageReload: reloadEntirePage
            };
        }

        return {
            create: createUpdater
        };
    })();
    contentRefresher.ContentUpdater = ContentUpdater;

    var LessStylesheetProcessor = (function() {
        function createLessPlugin(windowContext, consoleLogger) {
            var currentWindow = windowContext;
            var console = consoleLogger;

            function handleLessReload(resourcePath, updateOptions) {
                if (resourcePath.match(/\.less$/i)) {
                    if (currentWindow.less && currentWindow.less.refresh) {
                        currentWindow.less.refresh(updateOptions.liveCSS);
                        console.log("LiveRefresh: Less stylesheet reloaded.");
                        return true;
                    } else {
                        console.warn("LiveRefresh: Less file changed, but `less.refresh` not found. Reloading page.");
                        return false;
                    }
                }
                return false;
            }

            return {
                handleReload: handleLessReload
            };
        }
        return {
            create: createLessPlugin
        };
    })();

    var MainLiveReloader = (function() {
        function initializeLiveReload(windowContext, documentContext, consoleContext) {
            var currentConfig = configOptions.ConfigurationSettings.extractFromDOM(documentContext);
            if (!currentConfig) {
                consoleContext.log("LiveReload: No configuration found, not starting.");
                return;
            }

            var timerInstance = timeKeeper.IntervalManager;
            var updaterInstance = contentRefresher.ContentUpdater.create(windowContext, consoleContext, timerInstance);

            var connectionHandlers = {
                onConnecting: function() {
                    consoleContext.log("LiveReload: Connecting...");
                },
                onConnected: function(protocolVersion) {
                    consoleContext.log("LiveReload: Connected (protocol v" + protocolVersion + ").");
                },
                onDisconnected: function(reason, nextDelay) {
                    consoleContext.log("LiveReload: Disconnected (" + reason + "), reconnecting in " + (nextDelay / 1000) + "s.");
                },
                onError: function(error) {
                    consoleContext.error("LiveReload: Error - " + error.message);
                },
                onSocketConnected: function() {},
                onMessage: function(message) {
                    if (message.command === 'reload') {
                        updaterInstance.refreshContent(message.path, {
                            liveCSS: message.liveCSS,
                            liveImg: message.liveImg !== false
                        });
                    } else if (message.command === 'alert') {
                        alert(message.message);
                    }
                }
            };

            var connectionManager = networkHandler.ConnectionManager.create(
                currentConfig,
                windowContext.WebSocket,
                timerInstance,
                connectionHandlers
            );

            var globalReloaderAPI = {
                connect: function() { connectionManager.initiate(); },
                disconnect: function() { connectionManager.terminate(); },
                addUpdatePlugin: function(plugin) { updaterInstance.registerPlugin(plugin); }
            };

            windowContext.LiveRefresh = globalReloaderAPI;

            windowContext.LiveRefresh.addUpdatePlugin(LessStylesheetProcessor.create(windowContext, consoleContext));

            eventManagerHub.dispatchSignal(documentContext, 'refresh.ready');
        }

        document.addEventListener('DOMContentLoaded', function() {
            initializeLiveReload(window, document, console);
        });

        return {};
    })();

})();