const ContentFlowSystem = (function() {

    const DisplayState = {
        HIDDEN_ALL: 0,
        TITLES_ONLY: 1,
        COMPLETE_CONTENT: 2
    };

    const UiElementManipulator = {
        concealElement: function(domElem) {
            if (domElem && domElem.style) {
                domElem.style.display = 'none';
                domElem.style.visibility = 'hidden';
            }
        },
        revealElementBlock: function(domElem) {
            if (domElem && domElem.style) {
                domElem.style.display = 'block';
                domElem.style.visibility = 'visible';
            }
        },
        restoreElementDefault: function(domElem) {
            if (domElem && domElem.style) {
                domElem.style.display = '';
                domElem.style.visibility = '';
            }
        },
        isElementConcealed: function(domElem) {
            return domElem && (domElem.style.display === 'none' || domElem.style.visibility === 'hidden');
        },
        toggleElementVisibility: function(domElem) {
            if (UiElementManipulator.isElementConcealed(domElem)) {
                UiElementManipulator.revealElementBlock(domElem);
            } else {
                UiElementManipulator.concealElement(domElem);
            }
        },
        gatherAnchorTargets: function(targetRegistry, containerDom, relevanceScore) {
            if (!containerDom) return;
            const anchorElements = containerDom.getElementsByTagName("a");
            Array.from(anchorElements).forEach(anchor => {
                const uniqueIdentifier = anchor.getAttribute('id') || anchor.getAttribute('name');
                if (uniqueIdentifier) {
                    targetRegistry.set('#' + uniqueIdentifier, relevanceScore);
                }
            });
        }
    };

    /**
     * @typedef {object} ContentUnitData
     * @property {string} uniqueKey - The base ID (e.g., "sec-1-2")
     * @property {HTMLElement} primaryContainer - The outline-container- element
     * @property {HTMLElement} headerElement - The heading element (h1, h2, etc.)
     * @property {HTMLElement | null} textRegionElement - The text- element, if present
     * @property {HTMLElement | null} tocReferenceLink - The corresponding link in the TOC
     * @property {string | null} parentKey - Key of the parent unit
     * @property {string[]} childKeys - Array of child unit keys
     * @property {number} depthLevel - Depth in the hierarchy (e.g., h1=1)
     * @property {number} currentDisplayState - Current visibility state (DisplayState enum)
     * @property {boolean} containsSearchMatch - True if this unit contains search highlights
     * @property {boolean} individualModificationFlag - True if its state was changed independent of parent
     * @property {Map<string, number>} internalJumpTargets - Map of internal links within this unit
     */

    /** @type {Map<string, ContentUnitData>} */
    const contentRegistry = new Map();
    let currentlyFocusedUnitKey = null;
    let topMostUnitKey = null;

    const managementConfiguration = {
        mouseoverHighlight: false,
        initialPresentationMode: DisplayState.TITLES_ONLY,
        subIndexGeneration: false,
        upwardNavigationLink: '',
        homepageNavigationLink: '',
        tableOfContentsHidden: false,
        tableOfContentsCutoff: 0,
        initialNotificationShown: false,
        maximumScanAttempts: 1200,
        scanRetryInterval: 100,
        fixedTocLayout: false
    };

    let documentObservationTimer = null;
    let scanIterationCount = 0;

    const browseHistoryStack = [];
    let historyIndex = -1;
    let suppressHistoryRecording = false;

    const commandPromptInterface = {
        promptArea: null,
        promptInputControl: null,
        promptCaption: null,
        promptOffsetStyle: "50px",
        isPromptCurrentlyActive: false,
        activePromptCallback: null
    };

    let activeSearchString = "";
    let activeSearchRegex = null;
    const searchEmphasisPattern = new RegExp('(<span class="search-match-emphasis">)([^<]*?)(<\/span>)', "gi");
    let searchHighlightingActive = false;

    const systemEventHooks = {
        shouldRunHooks: false,
        onSectionDisplay: [],
        onSystemReady: []
    };

    const processUrlParameters = function() {
        if (!location.search) return;
        const querySegments = location.search.substring(1).split('&');
        querySegments.forEach(segment => {
            const separatorIndex = segment.indexOf('=');
            if (separatorIndex !== -1) {
                const settingKey = segment.substring(0, separatorIndex);
                const settingValue = decodeURIComponent(segment.substring(separatorIndex + 1));

                const keyMapping = {
                    'TOC': 'tableOfContentsHidden',
                    'TOC_DEPTH': 'tableOfContentsCutoff',
                    'MOUSE_HINT': 'mouseoverHighlight',
                    'VIEW': 'initialPresentationMode',
                    'HIDE_TOC': 'tableOfContentsHidden',
                    'LOCAL_TOC': 'subIndexGeneration',
                    'OCCUR': 'activeSearchString'
                };

                if (keyMapping[settingKey]) {
                    const mappedKey = keyMapping[settingKey];
                    if (mappedKey === 'initialPresentationMode') {
                        switch (settingValue.toLowerCase()) {
                            case 'overview':
                            case 'content':
                                managementConfiguration[mappedKey] = DisplayState.TITLES_ONLY;
                                break;
                            case 'all':
                                managementConfiguration[mappedKey] = DisplayState.COMPLETE_CONTENT;
                                break;
                            default:
                                managementConfiguration[mappedKey] = DisplayState.TITLES_ONLY;
                        }
                    } else if (mappedKey === 'tableOfContentsHidden') {
                        managementConfiguration[mappedKey] = (settingValue === 'true' || settingValue === '1');
                    } else if (mappedKey === 'subIndexGeneration') {
                        managementConfiguration[mappedKey] = (settingValue === 'true' || settingValue === '1' || settingValue === 'above' || settingValue === 'below');
                    } else {
                        managementConfiguration[mappedKey] = settingValue;
                    }
                }
            }
        });
    };

    const initializeManagementSystem = function() {
        processUrlParameters();
        managementConfiguration.initialPresentationMode = managementConfiguration.initialPresentationMode || DisplayState.TITLES_ONLY;
        documentObservationTimer = window.setTimeout(scanDocumentForContentUnits, 50);
    };

    const scanDocumentForContentUnits = function() {
        const primaryContainers = document.querySelectorAll('[id^="outline-container-"]');
        if (primaryContainers.length === 0 && scanIterationCount < managementConfiguration.maximumScanAttempts) {
            scanIterationCount++;
            documentObservationTimer = window.setTimeout(scanDocumentForContentUnits, managementConfiguration.scanRetryInterval);
            return;
        }

        if (primaryContainers.length === 0) {
            console.warn("ContentFlowSystem: No primary content containers found after maximum attempts.");
            return;
        }

        primaryContainers.forEach(container => {
            const fullId = container.id;
            const baseId = fullId.substring(18);

            const headerElem = container.querySelector('h1, h2, h3, h4, h5, h6');
            const contentElem = document.getElementById("text-" + baseId) || document.getElementById("text-" + baseId.substring(4));

            const headerLevel = headerElem ? parseInt(headerElem.tagName.substring(1)) : 0;

            /** @type {ContentUnitData} */
            const newUnit = {
                uniqueKey: baseId,
                primaryContainer: container,
                headerElement: headerElem,
                textRegionElement: contentElem,
                tocReferenceLink: null,
                parentKey: null,
                childKeys: [],
                depthLevel: headerLevel,
                currentDisplayState: DisplayState.HIDDEN_ALL,
                individualModificationFlag: false,
                containsSearchMatch: false,
                internalJumpTargets: new Map()
            };
            contentRegistry.set(baseId, newUnit);

            UiElementManipulator.gatherAnchorTargets(newUnit.internalJumpTargets, headerElem, 1);
            UiElementManipulator.gatherAnchorTargets(newUnit.internalJumpTargets, contentElem, 3);
        });

        let hierarchicalParentTracker = [];
        contentRegistry.forEach(unit => {
            while (hierarchicalParentTracker.length > 0 &&
                   contentRegistry.get(hierarchicalParentTracker[hierarchicalParentTracker.length - 1]).depthLevel >= unit.depthLevel) {
                hierarchicalParentTracker.pop();
            }
            if (hierarchicalParentTracker.length > 0) {
                const parentId = hierarchicalParentTracker[hierarchicalParentTracker.length - 1];
                unit.parentKey = parentId;
                contentRegistry.get(parentId).childKeys.push(unit.uniqueKey);
            }
            hierarchicalParentTracker.push(unit.uniqueKey);

            const tocLink = document.querySelector(`.table-of-contents a[href="#${unit.uniqueKey}"]`);
            if (tocLink) {
                unit.tocReferenceLink = tocLink;
            }

            if (unit.parentKey) {
                UiElementManipulator.concealElement(unit.primaryContainer);
            }
        });

        topMostUnitKey = Array.from(contentRegistry.values()).find(unit => unit.depthLevel === 1 && !unit.parentKey)?.uniqueKey;
        if (!topMostUnitKey && contentRegistry.size > 0) {
            topMostUnitKey = contentRegistry.keys().next().value;
        }

        if (topMostUnitKey) {
            applyUnitDisplayState(topMostUnitKey, managementConfiguration.initialPresentationMode, true);
            navigateToUnit(topMostUnitKey, false);
        }

        systemEventHooks.shouldRunHooks = true;
        systemEventHooks.onSystemReady.forEach(handler => handler());
    };

    const applyUnitDisplayState = function(unitKey, desiredState, propagateToChildren = false) {
        const unit = contentRegistry.get(unitKey);
        if (!unit) return;

        unit.currentDisplayState = desiredState;
        unit.individualModificationFlag = false;

        switch (desiredState) {
            case DisplayState.HIDDEN_ALL:
                UiElementManipulator.concealElement(unit.primaryContainer);
                UiElementManipulator.concealElement(unit.textRegionElement);
                break;
            case DisplayState.TITLES_ONLY:
                UiElementManipulator.revealElementBlock(unit.primaryContainer);
                UiElementManipulator.concealElement(unit.textRegionElement);
                break;
            case DisplayState.COMPLETE_CONTENT:
                UiElementManipulator.revealElementBlock(unit.primaryContainer);
                UiElementManipulator.revealElementBlock(unit.textRegionElement);
                break;
        }

        if (propagateToChildren) {
            unit.childKeys.forEach(childKey => applyUnitDisplayState(childKey, desiredState, true));
        }
    };

    const toggleUnitContentFolding = function(unitKey) {
        const unit = contentRegistry.get(unitKey);
        if (!unit) return;

        if (unit.parentKey) {
            const parentUnit = contentRegistry.get(unit.parentKey);
            if (parentUnit) parentUnit.individualModificationFlag = true;
        }

        if (unit.individualModificationFlag) {
            unit.individualModificationFlag = false;
            unit.currentDisplayState = DisplayState.COMPLETE_CONTENT;
        }

        switch (unit.currentDisplayState) {
            case DisplayState.HIDDEN_ALL:
                if (unit.childKeys.length > 0) {
                    applyUnitDisplayState(unitKey, DisplayState.TITLES_ONLY);
                    unit.childKeys.forEach(childKey => applyUnitDisplayState(childKey, DisplayState.TITLES_ONLY, true));
                } else {
                    applyUnitDisplayState(unitKey, DisplayState.COMPLETE_CONTENT);
                }
                break;
            case DisplayState.TITLES_ONLY:
                applyUnitDisplayState(unitKey, DisplayState.COMPLETE_CONTENT);
                unit.childKeys.forEach(childKey => applyUnitDisplayState(childKey, DisplayState.COMPLETE_CONTENT, true));
                break;
            case DisplayState.COMPLETE_CONTENT:
                applyUnitDisplayState(unitKey, DisplayState.HIDDEN_ALL);
                unit.childKeys.forEach(childKey => applyUnitDisplayState(childKey, DisplayState.HIDDEN_ALL, true));
                break;
        }
    };

    const navigateToUnit = function(unitKey, recordInHistory = true) {
        const targetUnit = contentRegistry.get(unitKey);
        if (!targetUnit) {
            console.warn(`ContentFlowSystem: Cannot focus on unknown unit key: ${unitKey}`);
            return;
        }

        if (currentlyFocusedUnitKey && contentRegistry.has(currentlyFocusedUnitKey)) {
            const oldUnit = contentRegistry.get(currentlyFocusedUnitKey);
            if (oldUnit.tocReferenceLink) {
                oldUnit.tocReferenceLink.className = "visited-after-load";
            }
        }

        let currentPathUnit = targetUnit;
        const pathUnits = [];
        while (currentPathUnit) {
            pathUnits.unshift(currentPathUnit.uniqueKey);
            currentPathUnit = currentPathUnit.parentKey ? contentRegistry.get(currentPathUnit.parentKey) : null;
        }

        contentRegistry.forEach(unit => {
            UiElementManipulator.concealElement(unit.primaryContainer);
            UiElementManipulator.concealElement(unit.textRegionElement);
        });

        pathUnits.forEach(keyInPath => {
            const unitInPath = contentRegistry.get(keyInPath);
            if (unitInPath) {
                UiElementManipulator.revealElementBlock(unitInPath.primaryContainer);
                if (keyInPath === unitKey || unitInPath.currentDisplayState === DisplayState.COMPLETE_CONTENT) {
                    UiElementManipulator.revealElementBlock(unitInPath.textRegionElement);
                } else {
                    UiElementManipulator.concealElement(unitInPath.textRegionElement);
                }
                if (keyInPath !== unitKey) {
                    unitInPath.currentDisplayState = DisplayState.TITLES_ONLY;
                }
            }
        });

        currentlyFocusedUnitKey = unitKey;
        targetUnit.currentDisplayState = DisplayState.COMPLETE_CONTENT;

        if (targetUnit.tocReferenceLink) {
            targetUnit.tocReferenceLink.className = "current-selection";
        }

        if (recordInHistory && !suppressHistoryRecording) {
            if (historyIndex < browseHistoryStack.length - 1) {
                browseHistoryStack.splice(historyIndex + 1);
            }
            browseHistoryStack.push(unitKey);
            if (browseHistoryStack.length > 50) {
                browseHistoryStack.shift();
            }
            historyIndex = browseHistoryStack.length - 1;
        }
        suppressHistoryRecording = false;

        systemEventHooks.onSectionDisplay.forEach(handler => handler(unitKey));
    };

    const travelBackward = function() {
        if (historyIndex > 0) {
            historyIndex--;
            suppressHistoryRecording = true;
            navigateToUnit(browseHistoryStack[historyIndex], false);
        }
    };

    const travelForward = function() {
        if (historyIndex < browseHistoryStack.length - 1) {
            historyIndex++;
            suppressHistoryRecording = true;
            navigateToUnit(browseHistoryStack[historyIndex], false);
        }
    };

    const initiateContentSearch = function(query) {
        activeSearchString = query;
        activeSearchRegex = new RegExp(query, 'gi');
        searchHighlightingActive = true;

        contentRegistry.forEach(unit => {
            if (unit.primaryContainer) {
                let currentHtml = unit.primaryContainer.innerHTML;
                currentHtml = currentHtml.replace(searchEmphasisPattern, '$2'); // Remove existing highlights
                if (query) {
                    currentHtml = currentHtml.replace(activeSearchRegex, (match) =>
                        `<span class="search-match-emphasis">${match}</span>`);
                }
                unit.primaryContainer.innerHTML = currentHtml;
            }
        });
    };

    const terminateContentSearch = function() {
        activeSearchString = "";
        activeSearchRegex = null;
        searchHighlightingActive = false;

        contentRegistry.forEach(unit => {
            if (unit.primaryContainer) {
                unit.primaryContainer.innerHTML = unit.primaryContainer.innerHTML.replace(/<span class="search-match-emphasis">([^<]+)<\/span>/gi, '$1');
            }
        });
    };

    return {
        config: managementConfiguration,
        unitRegistry: contentRegistry,
        currentActiveUnitId: () => currentlyFocusedUnitKey,
        rootUnitId: () => topMostUnitKey,

        startSystem: initializeManagementSystem,
        alterUnitDisplay: toggleUnitContentFolding,
        jumpToSpecificUnit: navigateToUnit,
        goBackInHistory: travelBackward,
        goForwardInHistory: travelForward,

        beginSearch: initiateContentSearch,
        endSearch: terminateContentSearch,
        isSearchActive: () => searchHighlightingActive,

        registerSystemHook: function(hookName, handlerFn) {
            if (systemEventHooks[hookName] && typeof handlerFn === 'function') {
                systemEventHooks[hookName].push(handlerFn);
            } else {
                console.warn(`ContentFlowSystem: Unknown hook "${hookName}" or handler is not a function.`);
            }
        },

        // Prompt / Minibuffer functionality
        displayCommandPrompt: function(message, completionCallback) {
            commandPromptInterface.promptCaption.textContent = message;
            UiElementManipulator.revealElementBlock(commandPromptInterface.promptArea);
            commandPromptInterface.promptInputControl.focus();
            commandPromptInterface.isPromptCurrentlyActive = true;
            commandPromptInterface.activePromptCallback = completionCallback;
        },
        hideCommandPrompt: function() {
            UiElementManipulator.concealElement(commandPromptInterface.promptArea);
            commandPromptInterface.promptInputControl.value = '';
            commandPromptInterface.isPromptCurrentlyActive = false;
            commandPromptInterface.activePromptCallback = null;
        },
        handlePromptInput: function(event) {
            if (event.key === 'Enter' && commandPromptInterface.isPromptCurrentlyActive) {
                const input = commandPromptInterface.promptInputControl.value;
                commandPromptInterface.hideCommandPrompt();
                if (typeof commandPromptInterface.activePromptCallback === 'function') {
                    commandPromptInterface.activePromptCallback(input);
                }
            } else if (event.key === 'Escape' && commandPromptInterface.isPromptCurrentlyActive) {
                commandPromptInterface.hideCommandPrompt();
            }
        },
        _promptInterface: commandPromptInterface // Expose for initial DOM setup
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const promptZone = document.createElement('div');
    promptZone.id = 'system-command-prompt-zone';
    promptZone.style.position = 'fixed';
    promptZone.style.bottom = '0';
    promptZone.style.left = '0';
    promptZone.style.width = '100%';
    promptZone.style.background = '#222';
    promptZone.style.color = 'lightgray';
    promptZone.style.padding = '6px';
    promptZone.style.zIndex = '10000';
    promptZone.style.display = 'none';
    promptZone.style.boxShadow = '0 -2px 5px rgba(0,0,0,0.3)';

    const promptText = document.createElement('span');
    promptText.style.marginRight = '12px';
    promptText.style.fontWeight = 'bold';
    promptZone.appendChild(promptText);

    const promptInputBox = document.createElement('input');
    promptInputBox.type = 'text';
    promptInputBox.style.width = 'calc(100% - 180px)';
    promptInputBox.style.background = '#444';
    promptInputBox.style.color = 'white';
    promptInputBox.style.border = '1px solid #666';
    promptInputBox.style.padding = '4px';
    promptInputBox.style.borderRadius = '3px';
    promptZone.appendChild(promptInputBox);

    document.body.appendChild(promptZone);

    ContentFlowSystem._promptInterface.promptArea = promptZone;
    ContentFlowSystem._promptInterface.promptInputControl = promptInputBox;
    ContentFlowSystem._promptInterface.promptCaption = promptText;

    promptInputBox.addEventListener('keydown', ContentFlowSystem.handlePromptInput);

    ContentFlowSystem.startSystem();

    document.body.addEventListener('click', (event) => {
        let currentEventTarget = event.target;
        while (currentEventTarget && currentEventTarget !== document.body) {
            if (currentEventTarget.tagName.match(/^H[1-6]$/i)) {
                const containingOutline = currentEventTarget.closest('[id^="outline-container-"]');
                if (containingOutline) {
                    const baseId = containingOutline.id.substring(18);
                    ContentFlowSystem.alterUnitDisplay(baseId);
                    event.preventDefault();
                    return;
                }
            } else if (currentEventTarget.tagName === 'A' && currentEventTarget.href && currentEventTarget.href.includes('#')) {
                const urlFragment = currentEventTarget.hash;
                if (urlFragment.startsWith('#sec-')) {
                    const baseId = urlFragment.substring(1);
                    if (ContentFlowSystem.unitRegistry.has(baseId)) {
                        ContentFlowSystem.jumpToSpecificUnit(baseId);
                        event.preventDefault();
                        return;
                    }
                }
            }
            currentEventTarget = currentEventTarget.parentNode;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!ContentFlowSystem._promptInterface.isPromptCurrentlyActive) {
            if (event.key === 'b' || event.key === 'ArrowLeft') {
                ContentFlowSystem.goBackInHistory();
            } else if (event.key === 'n' || event.key === 'ArrowRight') {
                ContentFlowSystem.goForwardInHistory();
            } else if (event.key === '/') {
                event.preventDefault();
                ContentFlowSystem.displayCommandPrompt("Find text: ", (query) => {
                    ContentFlowSystem.beginSearch(query);
                });
            } else if (event.key === 'Escape' && ContentFlowSystem.isSearchActive()) {
                ContentFlowSystem.endSearch();
            }
        }
    });
});