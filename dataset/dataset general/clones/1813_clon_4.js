(function() {
    "use strict";

    const obtainPromiseUnit = (operation) => new Promise(operation);
    const obtainDeferredUnit = () => {
        let completion, rejection;
        const process = new Promise((res, rej) => {
            completion = res;
            rejection = rej;
        });
        return { process, completion, rejection };
    };

    const fetchRemoteContent = (parameters) => {
        const { methodType, resourceUrl, useCache } = parameters;
        const requestOptions = { method: methodType || 'GET' };
        if (useCache === true) {
            requestOptions.cache = 'force-cache';
        } else if (useCache === false) {
            requestOptions.cache = 'no-store';
        }
        return obtainPromiseUnit((fulfill, decline) => {
            fetch(resourceUrl, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Data retrieval error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(parsedData => fulfill(parsedData))
                .catch(issue => decline(issue));
        });
    };

    const globalCommunicationHub = (() => {
        const eventListeners = new Map();
        const sharedDataRegistry = {};

        const attachListener = (eventIdentifier, handlerCallback) => {
            if (!eventListeners.has(eventIdentifier)) {
                eventListeners.set(eventIdentifier, new Set());
            }
            eventListeners.get(eventIdentifier).add(handlerCallback);
            return () => eventListeners.get(eventIdentifier).delete(handlerCallback);
        };

        const dispatchEvent = (eventIdentifier, ...payload) => {
            if (eventListeners.has(eventIdentifier)) {
                eventListeners.get(eventIdentifier).forEach(handlerCallback => handlerCallback(...payload));
            }
        };

        const updateSharedData = (keyName, newValue) => {
            const priorValue = sharedDataRegistry[keyName];
            sharedDataRegistry[keyName] = newValue;
            if (keyName === 'activeLexicon' && priorValue !== newValue) {
                 dispatchEvent('LEXICON_UPDATED_BROADCAST', newValue);
            } else if (keyName === 'currentDisplayCulture' && priorValue !== newValue) {
                 dispatchEvent('DISPLAY_CULTURE_ALTERED', newValue);
            }
        };

        const retrieveSharedData = (keyName) => sharedDataRegistry[keyName];

        return { attachListener, dispatchEvent, updateSharedData, retrieveSharedData };
    })();

    const systemSettings = {
        keyPathDelimiter: ".",
        setKeyPathDelimiter: function(symbol) {
            this.keyPathDelimiter = symbol;
        }
    };

    const languageTextProcessor = (() => {
        let activeCultureIdentifier = null;
        let lexiconReadyState = obtainDeferredUnit();
        let deferredRequestQueue = [];
        let lexiconIsLoaded = false;

        const accessNestedLexiconEntry = (termPath) => {
            const activeLexicon = globalCommunicationHub.retrieveSharedData('activeLexicon');
            if (!activeLexicon) return null;

            const pathSegments = termPath.split(systemSettings.keyPathDelimiter);
            let currentPathValue = activeLexicon;
            for (const segment of pathSegments) {
                if (!currentPathValue || typeof currentPathValue !== 'object' || !currentPathValue.hasOwnProperty(segment)) {
                    return null;
                }
                currentPathValue = currentPathValue[segment];
            }
            return currentPathValue;
        };

        const initializeCulture = (cultureCode) => {
            if (cultureCode === activeCultureIdentifier) {
                return lexiconReadyState.process;
            }

            if (lexiconReadyState) {
                deferredRequestQueue.push(lexiconReadyState);
            }
            lexiconReadyState = obtainDeferredUnit();
            lexiconIsLoaded = false;
            activeCultureIdentifier = cultureCode;
            globalCommunicationHub.updateSharedData('currentDisplayCulture', cultureCode);

            fetchRemoteContent({
                methodType: "get",
                resourceUrl: "/i18n/" + cultureCode,
                useCache: true
            }).then(vocabulary => {
                globalCommunicationHub.updateSharedData('activeLexicon', vocabulary);
                lexiconIsLoaded = true;
                lexiconReadyState.completion(vocabulary);

                while (deferredRequestQueue.length) {
                    deferredRequestQueue.pop().completion(vocabulary);
                }
                globalCommunicationHub.dispatchEvent("CULTURE_INITIALIZED");
            }).catch(error => {
                console.error("Failure to load vocabulary:", error);
                lexiconReadyState.rejection(error);
                while (deferredRequestQueue.length) {
                    deferredRequestQueue.pop().rejection(error);
                }
            });

            return lexiconReadyState.process;
        };

        const confirmLexiconReady = () => lexiconReadyState.process;

        const translateTerm = (termKey, ...formatArguments) => {
            const activeLexicon = globalCommunicationHub.retrieveSharedData('activeLexicon');
            if (!activeLexicon) {
                return termKey;
            }

            let translatedOutput = activeLexicon[termKey] || accessNestedLexiconEntry(termKey);
            if (!translatedOutput) {
                translatedOutput = termKey;

                activeLexicon[termKey] = translatedOutput;

                fetchRemoteContent({
                    methodType: "get",
                    resourceUrl: "/i18n/" + activeCultureIdentifier + "/" + encodeURIComponent(termKey)
                }).then(resolvedTranslation => {
                    activeLexicon[termKey] = resolvedTranslation;
                    globalCommunicationHub.dispatchEvent("TERM_UPDATED_BROADCAST", termKey, resolvedTranslation);
                }).catch(error => {
                    console.warn(`Could not update term entry for '${termKey}':`, error);
                });
            }

            if (formatArguments.length > 0 && typeof window.vsprintf === "function") {
                translatedOutput = window.vsprintf(translatedOutput, formatArguments);
            }
            return translatedOutput;
        };

        const translateQuantifiedTerm = (itemCount, singularTerm, pluralTerm) => {
            const activeLexicon = globalCommunicationHub.retrieveSharedData('activeLexicon');
            if (!activeLexicon) {
                return singularTerm;
            }

            let termForms = activeLexicon[singularTerm] || accessNestedLexiconEntry(singularTerm);
            if (!termForms) {
                if (!pluralTerm) {
                    pluralTerm = singularTerm;
                }
                termForms = { one: singularTerm, other: pluralTerm };
                activeLexicon[singularTerm] = termForms;

                const requestAddress =
                    "/i18n/" +
                    activeCultureIdentifier +
                    "/" +
                    encodeURIComponent(singularTerm) +
                    "?plural=" +
                    encodeURIComponent(pluralTerm) +
                    "&count=" +
                    encodeURIComponent(itemCount);

                fetchRemoteContent({ methodType: "get", resourceUrl: requestAddress }).then(response => {
                    activeLexicon[singularTerm] = response;
                    globalCommunicationHub.dispatchEvent("TERM_UPDATED_BROADCAST", singularTerm, response);
                }).catch(error => {
                    console.warn(`Could not update quantified term entry for '${singularTerm}':`, error);
                });
            }

            let finalRender = (itemCount == 1) ? termForms.one : termForms.other;

            if (typeof window.vsprintf === "function") {
                finalRender = window.vsprintf(finalRender, [itemCount]);
            }
            return finalRender;
        };

        return {
            initializeCulture,
            confirmLexiconReady,
            translateTerm,
            translateQuantifiedTerm,
            config: systemSettings,
            getVocabulary: () => globalCommunicationHub.retrieveSharedData('activeLexicon'),
            onCultureInitialized: (handler) => globalCommunicationHub.attachListener('CULTURE_INITIALIZED', handler)
        };
    })();

    const updateDomElementWithTranslation = (targetElement, textKey, countValue) => {
        const parsedCount = countValue !== undefined ? parseInt(countValue) : undefined;
        if (parsedCount === undefined || isNaN(parsedCount)) {
            targetElement.textContent = languageTextProcessor.translateTerm(textKey);
        } else {
            targetElement.textContent = languageTextProcessor.translateQuantifiedTerm(parsedCount, textKey, undefined);
        }
    };

    const setApplicationCulture = (cultureCode) => {
        languageTextProcessor.initializeCulture(cultureCode);
    };

    const processTranslationInput = (...inputArgs) => {
        function checkNumeric(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        }

        const firstArgument = inputArgs[0];
        if (checkNumeric(firstArgument)) {
            return languageTextProcessor.translateQuantifiedTerm(inputArgs[0], inputArgs[1], inputArgs[2]);
        } else {
            return languageTextProcessor.translateTerm(...inputArgs);
        }
    };

    if (typeof window !== 'undefined') {
        window.GlobalLanguageSystem = {
            setupDelimiter: systemSettings.setKeyPathDelimiter,
            setLanguage: languageTextProcessor.initializeCulture,
            getText: languageTextProcessor.translateTerm,
            getQuantifiedText: languageTextProcessor.translateQuantifiedTerm,
            awaitLanguageLoad: languageTextProcessor.confirmLexiconReady,
            applyTextToNode: updateDomElementWithTranslation,
            setLanguageFromNodeAttribute: setApplicationCulture,
            transformText: processTranslationInput,
            onLanguageChange: languageTextProcessor.onCultureInitialized,
            currentLanguageData: globalCommunicationHub.retrieveSharedData,
            eventBus: globalCommunicationHub
        };

        globalCommunicationHub.attachListener('DISPLAY_CULTURE_ALTERED', (newCulture) => {
            // This listener ensures that if 'currentDisplayCulture' is updated
            // (e.g., by initializeCulture), it can be observed.
            // The actual initialization logic is within initializeCulture itself.
        });

        globalCommunicationHub.attachListener('CULTURE_INITIALIZED', () => {
            // This is the equivalent of the original's $rootScope.$on("LOCALE_UPDATED").
            // Any consumer of this library would listen to this event to re-render
            // elements that depend on the lexicon.
        });
    }

})();