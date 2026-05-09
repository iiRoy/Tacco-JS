function createVisualCustomizer(externalLogger, tweakCore, fileService, preferenceService, componentService, windowService) {
    let internalStyleService = null;
    const compactStyleStatus = {
        primaryEnabled: false,
        secondaryEnabled: false
    };
    let dynamicStyleActive = false;
    let storedDynamicUri = null;
    let debounceScheduler = null;

    const visualSettings = {
        minPanelWidthVal: 5,
        minPanelHeightVal: 30,
        minProgressHeightVal: 6,
        maxProgressHeightVal: 50,
        refreshDelayMs: 300
    };

    const retrieveStyleService = () => {
        if (!internalStyleService) {
            internalStyleService = componentService.classes["@mozilla.org/content/style-sheet-service;1"]
                .getService(componentService.interfaces.nsIStyleSheetService);
        }
        return internalStyleService;
    };

    const processRawCss = (sourceString) => {
        const leadingIndent = sourceString.match(/^[ \t]*/)?.[0] || '';
        if (leadingIndent.length === 0) {
            return sourceString;
        }
        const indentPattern = new RegExp("^" + leadingIndent, "mg");
        return sourceString.replace(indentPattern, "");
    };

    const generateCssDataUri = (cssText) => {
        const cleanedText = processRawCss(cssText);
        return fileService.newURI("data:text/css," + encodeURIComponent(cleanedText), null, null);
    };

    const manageStylesheetState = (uriHandle, shouldBeLoaded) => {
        const service = retrieveStyleService();
        const currentlyLoaded = service.sheetRegistered(uriHandle, service.USER_SHEET);

        if (shouldBeLoaded === currentlyLoaded) {
            return;
        }

        if (shouldBeLoaded) {
            service.loadAndRegisterSheet(uriHandle, service.USER_SHEET);
        } else {
            service.unregisterSheet(uriHandle, service.USER_SHEET);
        }
    };

    const controlIndividualVisual = (fileName, statusKey, activate) => {
        if (activate === compactStyleStatus[statusKey]) {
            return;
        }
        compactStyleStatus[statusKey] = activate;
        const fileLoc = fileService.newURI("chrome://downloadpaneltweaker/content/" + fileName, null, null);
        manageStylesheetState(fileLoc, activate);
        externalLogger((activate ? "Activate" : "Deactivate") + " " + fileName);
    };

    const handleCompactVisuals = (setting) => {
        controlIndividualVisual("compactDownloads.css", "primaryEnabled", setting === 1);
        controlIndividualVisual("compactDownloadsForce.css", "secondaryEnabled", setting === 2);
    };

    const handleDynamicVisuals = (enable) => {
        if (enable === dynamicStyleActive) {
            return;
        }
        dynamicStyleActive = enable;

        let currentUri;
        if (enable) {
            const activeWindow = windowService.getMostRecentWindow(null);

            const dynamicParameters = {
                targetWidth: Math.max(visualSettings.minPanelWidthVal, preferenceService.get("panelWidth", 60)),
                targetMaxHeight: preferenceService.get("panelMaxHeight", 0),
                progressElementHeight: Math.max(visualSettings.minProgressHeightVal, Math.min(visualSettings.maxProgressHeightVal,
                    preferenceService.get("progressBarHeight", 10)
                )),
                browserVersion: tweakCore.fxVersion,
                pausedDataAttribute: tweakCore.pausedAttr,
                decolorizePausedItems: preferenceService.get("decolorizePausedProgress")
            };

            const displayMaxHeight = dynamicParameters.targetMaxHeight <= 0
                ? "none"
                : Math.max(visualSettings.minPanelHeightVal, dynamicParameters.targetMaxHeight) + "px";

            const itemSelector = dynamicParameters.browserVersion >= 20
                ? ".downloadContainer"
                : ".download-state > vbox";

            const textDecorationPrefix = activeWindow && "textDecorationStyle" in activeWindow.document.documentElement.style
                ? ""
                : "-moz-";

            const monochromeFilter = dynamicParameters.browserVersion >= 36
                ? "grayscale(1)"
                : 'url("chrome://mozapps/skin/extensions/extensions.svg#greyscale")';

            const styleDefinition = {
                '@namespace': 'url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul")',
                '@-moz-document': {
                    'url("chrome://browser/content/browser.xul"), url("chrome://browser/content/places/places.xul"), url("about:downloads"), url("chrome://browser/content/downloads/contentAreaDownloadsView.xul")': {
                        '#downloadsListBox': {
                            'width': 'auto !important',
                            'min-width': '0 !important',
                            'max-width': 'none !important',
                            'max-height': `${displayMaxHeight} !important`,
                        },
                        [itemSelector]: {
                            'width': `${dynamicParameters.targetWidth}ch !important`,
                            'min-width': '0 !important',
                        },
                        '#downloadsSummaryDescription, #downloadsSummaryDetails': {
                            'width': `${dynamicParameters.targetWidth}ch !important`,
                            'min-width': '0 !important',
                        },
                        '.downloadTarget': {
                            'min-width': '5ch !important',
                        },
                        '.downloadProgress': {
                            'min-width': '20px !important',
                            'min-height': `${dynamicParameters.progressElementHeight}px !important`,
                            'height': `${dynamicParameters.progressElementHeight}px !important`,
                        },
                        '.downloadProgress > .progress-bar': {
                            'height': 'auto !important',
                            'min-height': '2px !important',
                            'max-height': `${dynamicParameters.progressElementHeight}px !important`,
                        }
                    }
                }
            };

            if (dynamicParameters.decolorizePausedItems) {
                const docRule = styleDefinition['@-moz-document']['url("chrome://browser/content/browser.xul"), url("chrome://browser/content/places/places.xul"), url("about:downloads"), url("chrome://browser/content/downloads/contentAreaDownloadsView.xul")'];
                docRule['.download-state[state="4"] .downloadProgress, #' + dynamicParameters.pausedDataAttribute + ' .downloadProgress'] = {
                    'filter': monochromeFilter
                };
                docRule['.download-state[state="4"] .downloadProgress > .progress-bar, .download-state[state="4"] .downloadProgress > .progress-remainder, #' + dynamicParameters.pausedDataAttribute + ' .downloadProgress > .progress-bar, #' + dynamicParameters.pausedDataAttribute + ' .downloadProgress > .progress-remainder'] = {
                    'opacity': '0.85'
                };
            }

            styleDefinition['@-moz-document']['url("about:addons"), url("chrome://mozapps/content/extensions/extensions.xul")'] = {
                '.downloadPanelTweaker-item[tooltiptext]': {
                    'text-decoration': 'underline',
                    [textDecorationPrefix + 'text-decoration-style']: 'dotted',
                },
                '.downloadPanelTweaker-indent .preferences-title': {
                    '-moz-margin-start': '4ch !important',
                },
            };

            const serializeCss = (obj, indentLevel = 0) => {
                let cssString = '';
                const indent = '    '.repeat(indentLevel);
                for (const key in obj) {
                    const value = obj[key];
                    if (typeof value === 'object' && value !== null) {
                        if (key.startsWith('@')) {
                            cssString += `${indent}${key} {\n`;
                            cssString += serializeCss(value, indentLevel + 1);
                            cssString += `${indent}}\n`;
                        } else {
                            cssString += `${indent}${key} {\n`;
                            cssString += serializeCss(value, indentLevel + 1);
                            cssString += `${indent}}\n`;
                        }
                    } else {
                        cssString += `${indent}${key}: ${value};\n`;
                    }
                }
                return cssString;
            };

            const generatedCssContent = serializeCss(styleDefinition);
            currentUri = generateCssDataUri(generatedCssContent);
            storedDynamicUri = currentUri;
        } else {
            currentUri = storedDynamicUri;
        }

        manageStylesheetState(currentUri, enable);
        externalLogger(`Dynamic visual state changed to (${enable})`);
    };

    const refreshDynamicVisuals = () => {
        handleDynamicVisuals(false);
        handleDynamicVisuals(true);
    };

    const triggerDynamicRefresh = () => {
        if (debounceScheduler) {
            debounceScheduler.cancel();
        } else {
            debounceScheduler = componentService.classes["@mozilla.org/timer;1"]
                .createInstance(componentService.interfaces.nsITimer);
        }

        debounceScheduler.init(() => {
            debounceScheduler = null;
            refreshDynamicVisuals();
        }, visualSettings.refreshDelayMs, componentService.interfaces.nsITimer.TYPE_ONE_SHOT);
    };

    return {
        utilityCore: tweakCore,

        applyAllDisplayAdjustments: (activate) => {
            const compactOption = activate ? preferenceService.get("compactDownloads") : 0;
            handleCompactVisuals(compactOption);
            handleDynamicVisuals(activate);
        },

        reinitDynamicAdjustments: refreshDynamicVisuals,

        scheduleDynamicRefresh: triggerDynamicRefresh,
    };
}