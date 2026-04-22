(function() {
    const internalRegistry = new Map();
    internalRegistry.set('baseAddress', 'https://bibles.org/v2/');
    internalRegistry.set('accessCode', '');
    internalRegistry.set('lastIssue', '');
    internalRegistry.set('fumsIncludeUrl', '');
    internalRegistry.set('fumsScriptTagInjected', false);
    internalRegistry.set('fumsExecutionInterval', null);
    internalRegistry.set('fumsSuppressionFlag', false);
    internalRegistry.set('asyncOperation', true);
    internalRegistry.set('loggingActive', false);

    const logMessage = (content) => {
        if (internalRegistry.get('loggingActive')) {
            console.log(`ScriptureProbe: ${content}`);
        }
    };

    const determineNetworkStatus = () => {
        if (navigator.connection && (navigator.connection.type === 'unknown' || navigator.connection.type === 'none')) {
            logMessage('Network connectivity is down');
            return false;
        } else {
            logMessage('Network connectivity is up');
            return true;
        }
    };

    const processTimeout = () => {
        console.log('ScriptureProbe data request timed out');
    };

    const processJsonText = (rawText) => {
        if (typeof rawText !== 'string' || !rawText) {
            return null;
        }
        const trimPattern = /^[ \t\r\n\f]+|((?:^|[^\\\\])(?:\\\\.)*)[ \t\r\n\f]+$/g;
        const cleansedText = (rawText + '').replace(trimPattern, '');
        try {
            return JSON.parse(cleansedText);
        } catch (e) {
            logMessage(`JSON parsing error: ${e}`);
            return null;
        }
    };

    const executeRemoteCall = (resourcePath, inputOptions, completionHandler, customTimeoutHandler) => {
        completionHandler = completionHandler || (() => {});

        if (!determineNetworkStatus()) {
            logMessage('Remote data call failed. No network.');
            internalRegistry.set('lastIssue', 'Network is not up.');
            return false;
        }

        const currentAccessCode = internalRegistry.get('accessCode');
        if (currentAccessCode === '') {
            internalRegistry.set('lastIssue', 'Access code must be supplied.');
            return false;
        }

        let requestEndpoint = resourcePath;
        if (requestEndpoint.startsWith('/')) {
            requestEndpoint = requestEndpoint.substring(1);
        }
        let fullRequestUrl = internalRegistry.get('baseAddress') + requestEndpoint;

        fullRequestUrl = fullRequestUrl.replace('//', '//' + currentAccessCode + ':x@');

        const requestAgent = new XMLHttpRequest();

        requestAgent.onreadystatechange = () => {
            logMessage(`XHR state: ${requestAgent.readyState}`);
            if (requestAgent.readyState === 4) {
                logMessage(`XHR status: ${requestAgent.status}`);
                if (requestAgent.status === 200) {
                    logMessage(`XHR response: ${requestAgent.responseText}`);
                    const parsedPayload = scriptureProbe.interpretJson(requestAgent.responseText);

                    if (parsedPayload && parsedPayload.response && parsedPayload.response.meta) {
                        scriptureProbe.setFumsIncludeSource(parsedPayload.response.meta.fums_js_include);
                        scriptureProbe.initiateFumsExecution(parsedPayload.response.meta.fums_js);
                    }

                    completionHandler(parsedPayload);
                } else {
                    logMessage(`XHR error: ${requestAgent.status} - ${requestAgent.statusText}`);
                    internalRegistry.set('lastIssue', `API Error: ${requestAgent.status} ${requestAgent.statusText}`);
                    completionHandler(null, new Error(internalRegistry.get('lastIssue')));
                }
            }
        };

        requestAgent.open('GET', fullRequestUrl, internalRegistry.get('asyncOperation'));

        if (navigator.userAgent.match(/Android/)) {
            requestAgent.setRequestHeader('Authorization', 'Basic ' + btoa(currentAccessCode + ':x'));
        }

        requestAgent.timeout = 10000;
        requestAgent.ontimeout = customTimeoutHandler ? customTimeoutHandler : processTimeout;
        requestAgent.send(null);

        return true;
    };

    const scriptureProbe = {
        activateTrace() {
            internalRegistry.set('loggingActive', true);
        },
        deactivateTrace() {
            internalRegistry.set('loggingActive', false);
        },
        assignCode(code) {
            internalRegistry.set('accessCode', code);
        },
        retrieveCode() {
            return internalRegistry.get('accessCode');
        },
        setAsyncOperation(mode) {
            internalRegistry.set('asyncOperation', mode);
        },
        getAsyncOperation() {
            return internalRegistry.get('asyncOperation');
        },
        fetchRecentIssue() {
            const issue = internalRegistry.get('lastIssue');
            internalRegistry.set('lastIssue', '');
            return issue;
        },
        checkConnectivity: determineNetworkStatus,
        processTimeout: processTimeout,

        locateContent(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.queryText) {
                internalRegistry.set('lastIssue', 'Provide a search query.');
                return false;
            }
            let queryUrl = `search.js?query=${settings.queryText}`;
            if (settings.edition) {
                queryUrl += `&version=${settings.edition}`;
            }
            return executeRemoteCall(queryUrl, settings, handler);
        },

        listTranslations(handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            return executeRemoteCall('versions.js', {}, handler);
        },

        editionVolumes(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            let volumeUrl = `versions/${settings.editionIdentifier}/books.js`;
            if (settings.covenant) {
                volumeUrl += `?testament=${settings.covenant}`;
            }
            return executeRemoteCall(volumeUrl, settings, handler);
        },

        translationsByTongue(languageCode, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (languageCode === null || languageCode === '') {
                internalRegistry.set('lastIssue', 'Must provide a language.');
                return false;
            }
            return executeRemoteCall(`versions.js?language=${languageCode}`, {}, handler);
        },

        translationDetails(editionId, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (editionId === null || editionId === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            return executeRemoteCall(`versions/${editionId}.js`, {}, handler);
        },

        retrieveVolume(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            if (!settings.volumeIdentifier || settings.volumeIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide a volume ID.');
                return false;
            }
            const volumePath = `books/${settings.editionIdentifier}:${settings.volumeIdentifier}.js`;
            return executeRemoteCall(volumePath, settings, handler);
        },

        volumeSections(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            if (!settings.volumeIdentifier || settings.volumeIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide a volume ID.');
                return false;
            }
            const sectionsPath = `books/${settings.editionIdentifier}:${settings.volumeIdentifier}/chapters.js`;
            return executeRemoteCall(sectionsPath, settings, handler);
        },

        extractChapter(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            if (!settings.volumeIdentifier || settings.volumeIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide a volume ID.');
                return false;
            }
            if (!settings.sectionNumber || settings.sectionNumber === '') {
                internalRegistry.set('lastIssue', 'Must provide a section number.');
                return false;
            }

            let sectionPath = `chapters/${settings.editionIdentifier}:${settings.volumeIdentifier}.${settings.sectionNumber}.js`;
            if (settings && settings.notesIncluded) {
                sectionPath += `?include_marginalia=${settings.notesIncluded}`;
            }
            return executeRemoteCall(sectionPath, settings, handler);
        },

        sectionPassages(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            if (!settings.volumeIdentifier || settings.volumeIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide a volume ID.');
                return false;
            }
            if (!settings.sectionNumber || settings.sectionNumber === '') {
                internalRegistry.set('lastIssue', 'Must provide a section number.');
                return false;
            }

            let passageBaseUrl = `chapters/${settings.editionIdentifier}:${settings.volumeIdentifier}.${settings.sectionNumber}/verses.js`;
            let queryStringParts = [];

            if (settings.startPassage && settings.startPassage !== '') {
                queryStringParts.push(`start=${settings.startPassage}`);
            }
            if (settings.endPassage && settings.endPassage !== '') {
                queryStringParts.push(`end=${settings.endPassage}`);
            }

            let finalPassageUrl = passageBaseUrl;
            if (queryStringParts.length > 0) {
                finalPassageUrl += `?${queryStringParts.join('&')}`;
            }
            return executeRemoteCall(finalPassageUrl, settings, handler);
        },

        findVersesByTerm(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.searchTerm || settings.searchTerm === '') {
                internalRegistry.set('lastIssue', 'Must provide a search term.');
                return false;
            }

            let builtPath = 'verses.js?';
            for (const paramKey in settings) {
                if (Object.prototype.hasOwnProperty.call(settings, paramKey)) {
                    builtPath += `${paramKey}=${settings[paramKey]}&`;
                }
            }
            builtPath = builtPath.slice(0, -1);
            return executeRemoteCall(builtPath, settings, handler);
        },

        retrieveVersesByReference(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.editionIdentifier || settings.editionIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide an edition ID.');
                return false;
            }
            if (!settings.volumeIdentifier || settings.volumeIdentifier === '') {
                internalRegistry.set('lastIssue', 'Must provide a volume ID.');
                return false;
            }
            if (!settings.sectionNumber || settings.sectionNumber === '') {
                internalRegistry.set('lastIssue', 'Must provide a section number.');
                return false;
            }
            if (!settings.passageNumber || settings.passageNumber === '') {
                internalRegistry.set('lastIssue', 'Must provide a passage number.');
                return false;
            }

            const referencePath = `verses/${settings.editionIdentifier}:${settings.volumeIdentifier}.${settings.sectionNumber}.${settings.passageNumber}.js`;
            return executeRemoteCall(referencePath, settings, handler);
        },

        retrieveExcerpts(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!settings || !settings.excerptList || settings.excerptList === '') {
                internalRegistry.set('lastIssue', 'Must provide excerpts.');
                return false;
            }

            let excerptUrl = '';
            if (settings.editionIdentifier && settings.editionIdentifier !== '') {
                excerptUrl += `${settings.editionIdentifier}/`;
            }
            excerptUrl += `passages.js?q[]=${settings.excerptList}`;
            return executeRemoteCall(excerptUrl, settings, handler);
        },

        listVolumeGroups(settings, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }

            let groupUrl = 'bookgroups';
            if (settings && settings.groupIdentifier && settings.groupIdentifier !== '') {
                groupUrl += `/${settings.groupIdentifier}`;
            }
            groupUrl += '.js';
            return executeRemoteCall(groupUrl, settings, handler);
        },

        continuePath(relativeUrl, handler) {
            if (internalRegistry.get('accessCode') === '') {
                internalRegistry.set('lastIssue', 'Access code must be supplied.');
                return false;
            }
            if (!relativeUrl || relativeUrl === '') {
                internalRegistry.set('lastIssue', 'No path provided');
                return false;
            }
            return executeRemoteCall(relativeUrl, {}, handler);
        },

        interpretJson: processJsonText,

        setFumsIncludeSource: (url) => {
            internalRegistry.set('fumsIncludeUrl', url);
        },
        initiateFumsExecution: (evalContent) => {
            if (internalRegistry.get('fumsSuppressionFlag')) {
                return;
            }

            if (!internalRegistry.get('fumsScriptTagInjected') && internalRegistry.get('fumsIncludeUrl')) {
                const scriptElem = document.createElement('script');
                scriptElem.type = 'text/javascript';
                scriptElem.src = internalRegistry.get('fumsIncludeUrl');
                document.head.appendChild(scriptElem);
                internalRegistry.set('fumsScriptTagInjected', true);
            }

            if (internalRegistry.get('fumsExecutionInterval')) {
                clearInterval(internalRegistry.get('fumsExecutionInterval'));
                internalRegistry.set('fumsExecutionInterval', null);
            }

            internalRegistry.set('fumsExecutionInterval', setInterval(() => {
                if (evalContent) {
                    try {
                        (new Function(evalContent))();
                        clearInterval(internalRegistry.get('fumsExecutionInterval'));
                        internalRegistry.set('fumsExecutionInterval', null);
                    } catch (e) {
                        logMessage(`FUMS evaluation error: ${e}`);
                        clearInterval(internalRegistry.get('fumsExecutionInterval'));
                        internalRegistry.set('fumsExecutionInterval', null);
                    }
                } else {
                    clearInterval(internalRegistry.get('fumsExecutionInterval'));
                    internalRegistry.set('fumsExecutionInterval', null);
                }
            }, 100));
        }
    };

    if (!window.plugins) {
        window.plugins = {};
    }
    window.plugins.scriptureProbe = scriptureProbe;
})();