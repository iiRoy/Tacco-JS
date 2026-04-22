window.SuggestMaster = (function() {

    // --- Utility Functions ---
    function extendDeep(target, source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    if (typeof target[key] !== 'object' || target[key] === null || Array.isArray(target[key])) {
                        target[key] = {};
                    }
                    extendDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    function removeWhitespace(text) {
        return text == null ? '' : String(text).replace(/^\s+|\s+$/g, '');
    }

    function adjustCursorPosition(element, start, end) {
        if (element.setSelectionRange) {
            element.setSelectionRange(start, end);
        } else if (element.createTextRange) { // IE fallback
            const range = element.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    }

    // --- Key Identifier Mapping ---
    const TriggerKeys = {
        UP: 'ArrowUp',
        DOWN: 'ArrowDown',
        DEL: 'Delete',
        TAB: 'Tab',
        ENTER: 'Enter',
        ESCAPE: 'Escape',
        COMMA: ',',
        PAGE_UP: 'PageUp',
        PAGE_DOWN: 'PageDown',
        BACKSPACE: 'Backspace'
    };

    // --- Custom Event Dispatcher ---
    class EmitterHub {
        constructor() {
            this.subscribers = {};
        }

        listen(eventName, callback) {
            if (!this.subscribers[eventName]) {
                this.subscribers[eventName] = [];
            }
            this.subscribers[eventName].push(callback);
        }

        unlisten(eventName, callback) {
            if (this.subscribers[eventName]) {
                this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
            }
        }

        notify(eventName, payload = {}) {
            if (this.subscribers[eventName]) {
                this.subscribers[eventName].forEach(callback => callback(payload));
            }
        }

        clearAllListeners() {
            this.subscribers = {};
        }
    }

    // --- Data Storage Component ---
    class DataVault {
        constructor(configuration) {
            this.configuration = configuration;
            this.dataMap = new Map();
            this.itemCount = 0;
            this.localDataLoaded = false;
            if (configuration.sourceData && !configuration.remoteUrl) {
                // Mimic original's setTimeout for populate
                setTimeout(() => this.initializeLocalData(), 25);
            }
        }

        initializeLocalData() {
            if (this.localDataLoaded || !this.configuration.sourceData) return;

            const categorizedMatches = new Map();
            let zeroCharMatches = [];
            let currentNullCount = 0;

            const dataItems = this.configuration.sourceData;
            const maxVisibleItems = this.configuration.maximumSuggestions;

            for (let i = 0; i < dataItems.length; i++) {
                let rawEntry = dataItems[i];
                rawEntry = (typeof rawEntry === 'string') ? [rawEntry] : rawEntry;

                const formattedContent = this.configuration.itemFormatter(rawEntry, i + 1, dataItems.length);
                if (formattedContent === false) continue;

                const initialChar = String(formattedContent).charAt(0).toLowerCase();
                if (!categorizedMatches.has(initialChar)) {
                    categorizedMatches.set(initialChar, []);
                }

                const processedEntry = {
                    displayValue: formattedContent,
                    originalData: rawEntry,
                    selectedOutput: this.configuration.resultFormatter ? this.configuration.resultFormatter(rawEntry) : formattedContent
                };

                categorizedMatches.get(initialChar).push(processedEntry);

                if (currentNullCount < maxVisibleItems) {
                    zeroCharMatches.push(processedEntry);
                    currentNullCount++;
                }
            }

            categorizedMatches.forEach((val, key) => {
                this.store(key, val);
            });
            this.store('', zeroCharMatches); // Store items for empty query

            this.localDataLoaded = true;
        }

        store(queryKey, results) {
            if (this.itemCount >= this.configuration.dataCacheLimit) {
                this.clear();
            }
            if (!this.dataMap.has(queryKey)) {
                this.itemCount++;
            }
            this.dataMap.set(queryKey, results);
        }

        fetch(queryKey) {
            return this.dataMap.get(queryKey);
        }

        clear() {
            this.dataMap.clear();
            this.itemCount = 0;
            if (this.configuration.sourceData && !this.configuration.remoteUrl) {
                this.localDataLoaded = false;
                this.initializeLocalData();
            }
        }
    }

    // --- Suggestion List Renderer Component ---
    class ListRenderer {
        constructor(inputElement, config, selectAction, interactionTracker) {
            this.inputElement = inputElement;
            this.config = config;
            this.onItemSelect = selectAction;
            this.interactionTracker = interactionTracker; // To manage mouse state

            this.displayZone = document.createElement('div');
            this.displayZone.className = config.resultsContainerClass;
            this.displayZone.style.position = 'absolute';
            this.displayZone.style.zIndex = '9999';
            this.displayZone.style.display = 'none';

            this.resultsListing = document.createElement('ul');
            this.resultsListing.className = config.resultsListClass;
            this.displayZone.appendChild(this.resultsListing);

            document.body.appendChild(this.displayZone);

            this.displayedItems = [];
            this.activeItemIndex = -1;

            this.attachInteractionHandlers();
        }

        attachInteractionHandlers() {
            this.resultsListing.addEventListener('mouseover', this.handleListMouseOver.bind(this));
            this.resultsListing.addEventListener('mousedown', this.handleListMouseDown.bind(this));
            this.resultsListing.addEventListener('click', this.handleListClick.bind(this));
        }

        handleListMouseOver(event) {
            const hoveredItem = event.target.closest(`.${this.config.suggestionItemClass}`);
            if (hoveredItem) {
                const newIndex = Array.from(this.resultsListing.children).indexOf(hoveredItem);
                this.setHighlightedItem(newIndex);
            }
        }

        handleListMouseDown() {
            this.interactionTracker.isMouseSelecting = true;
        }

        handleListClick() {
            this.interactionTracker.isMouseSelecting = false;
            if (this.activeItemIndex !== -1) {
                this.onItemSelect(this.displayedItems[this.activeItemIndex]);
            }
        }

        setHighlightedItem(index) {
            if (this.activeItemIndex !== -1 && this.resultsListing.children[this.activeItemIndex]) {
                this.resultsListing.children[this.activeItemIndex].classList.remove(this.config.activeSuggestionClass);
            }
            this.activeItemIndex = index;
            if (this.activeItemIndex !== -1 && this.resultsListing.children[this.activeItemIndex]) {
                this.resultsListing.children[this.activeItemIndex].classList.add(this.config.activeSuggestionClass);
                this.scrollIntoView(this.resultsListing.children[this.activeItemIndex]);
            }
        }

        scrollIntoView(element) {
            const container = this.resultsListing;
            if (element.offsetTop + element.offsetHeight > container.scrollTop + container.offsetHeight) {
                container.scrollTop = element.offsetTop + element.offsetHeight - container.offsetHeight;
            } else if (element.offsetTop < container.scrollTop) {
                container.scrollTop = element.offsetTop;
            }
        }

        update(items, queryFragment) {
            this.displayedItems = items;
            this.resultsListing.innerHTML = '';
            this.activeItemIndex = -1;

            if (items.length === 0) {
                this.conceal();
                return;
            }

            items.forEach((item) => {
                const li = document.createElement('li');
                li.className = this.config.suggestionItemClass;
                li.innerHTML = this.config.textHighlighter(item.displayValue, queryFragment);
                this.resultsListing.appendChild(li);
            });

            const inputMetrics = this.inputElement.getBoundingClientRect();
            this.displayZone.style.width = (this.config.displayPanelWidth > 0 ? this.config.displayPanelWidth : inputMetrics.width) + 'px';

            if (this.config.enableScrolling && items.length > this.config.maximumSuggestions) {
                this.resultsListing.style.maxHeight = this.config.scrollThreshold + 'px';
                this.resultsListing.style.overflowY = 'auto';
            } else {
                this.resultsListing.style.maxHeight = '';
                this.resultsListing.style.overflowY = '';
            }

            this.positionAndReveal();

            if (this.config.autoSelectFirst) {
                this.setHighlightedItem(0);
            }
        }

        positionAndReveal() {
            const inputMetrics = this.inputElement.getBoundingClientRect();
            this.displayZone.style.top = (inputMetrics.top + inputMetrics.height + window.scrollY) + 'px';
            this.displayZone.style.left = (inputMetrics.left + window.scrollX) + 'px';
            this.displayZone.style.display = 'block';
        }

        conceal() {
            if (this.isRevealed()) {
                this.displayZone.style.display = 'none';
                this.resultsListing.innerHTML = '';
                this.displayedItems = [];
                this.activeItemIndex = -1;
            }
        }

        isRevealed() {
            return this.displayZone.style.display !== 'none';
        }

        navigateUp() {
            if (!this.isRevealed()) return;
            const newIndex = this.activeItemIndex - 1;
            this.setHighlightedItem(Math.max(0, newIndex));
        }

        navigateDown() {
            if (!this.isRevealed()) return;
            const newIndex = this.activeItemIndex + 1;
            this.setHighlightedItem(Math.min(this.displayedItems.length - 1, newIndex));
        }

        pageUp() {
            if (!this.isRevealed()) return;
            const itemsPerPage = Math.floor(this.resultsListing.offsetHeight / (this.resultsListing.children[0]?.offsetHeight || 1));
            const newIndex = Math.max(0, this.activeItemIndex - itemsPerPage);
            this.setHighlightedItem(newIndex);
        }

        pageDown() {
            if (!this.isRevealed()) return;
            const itemsPerPage = Math.floor(this.resultsListing.offsetHeight / (this.resultsListing.children[0]?.offsetHeight || 1));
            const newIndex = Math.min(this.displayedItems.length - 1, this.activeItemIndex + itemsPerPage);
            this.setHighlightedItem(newIndex);
        }

        getCurrentSelection() {
            return this.activeItemIndex !== -1 ? this.displayedItems[this.activeItemIndex] : null;
        }

        destroy() {
            this.resultsListing.removeEventListener('mouseover', this.handleListMouseOver);
            this.resultsListing.removeEventListener('mousedown', this.handleListMouseDown);
            this.resultsListing.removeEventListener('click', this.handleListClick);
            this.displayZone.remove();
        }
    }

    // --- Main Typeahead Functionality ---
    class SearchPrompt {
        constructor(targetInput, userConfig) {
            if (!targetInput || !(targetInput instanceof HTMLElement)) {
                console.error("SuggestMaster: Target input element is invalid.");
                return;
            }

            this.inputElement = targetInput;
            this.inputElement.setAttribute('autocomplete', 'off');
            this.inputElement.classList.add(SearchPrompt.globalDefaults.inputFieldClass);

            const mergedConfig = extendDeep({}, SearchPrompt.globalDefaults);
            this.config = extendDeep(mergedConfig, userConfig);

            // Process source type
            const isRemote = typeof this.config.source === "string";
            this.config.remoteUrl = isRemote ? this.config.source : null;
            this.config.sourceData = isRemote ? null : this.config.source;
            this.config.queryDelay = isRemote ? this.config.queryDelay : 10;
            this.config.maximumSuggestions = this.config.enableScrolling ? this.config.maximumSuggestions : 150;

            // Ensure highlight and formatMatch exist
            this.config.textHighlighter = this.config.textHighlighter || ((val) => val);
            this.config.itemFormatter = this.config.itemFormatter || this.config.resultFormatter;

            this.previousInputValue = '';
            this.inputFocusCount = 0;
            this.lastKeyPressed = null;
            this.searchTimer = null;
            this.mouseSelectionState = { isMouseSelecting: false };
            this.currentAbortController = null; // For cancelling fetch requests

            this.dataStorage = new DataVault(this.config);
            this.suggestionRenderer = new ListRenderer(this.inputElement, this.config, this.processSelection.bind(this), this.mouseSelectionState);

            this.eventBus = new EmitterHub();
            this.attachInputListeners();
            this.attachInternalListeners();
        }

        // --- Default Configuration ---
        static globalDefaults = {
            inputFieldClass: "prompt_input",
            resultsContainerClass: "prompt_results_container",
            resultsListClass: "prompt_list",
            suggestionItemClass: "prompt_item",
            activeSuggestionClass: "prompt_active",
            loadingIndicatorClass: "prompt_loading",
            minimumChars: 1,
            queryDelay: 400,
            caseInsensitive: false,
            matchWordBoundary: false,
            matchAnywhere: false,
            dataCacheLimit: 10,
            maximumSuggestions: 10,
            requireMatch: false,
            additionalParameters: {},
            autoSelectFirst: false,
            itemFormatter: (row) => row[0],
            resultFormatter: null, // will fallback to itemFormatter
            autoFillInput: false,
            displayPanelWidth: 0,
            multiEntryMode: false,
            multiEntrySeparator: ", ",
            textHighlighter: (value, term) => {
                const escapeRegex = (str) => str.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1");
                return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeRegex(term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
            },
            enableScrolling: true,
            scrollThreshold: 180,
            source: null, // URL or array
            responseDataType: 'json', // 'text' or 'json'
            responseParser: null // custom parser function
        };

        // --- Event Attachment ---
        attachInputListeners() {
            this.inputElement.addEventListener('keydown', this.handleKeyDownEvent.bind(this));
            this.inputElement.addEventListener('input', this.handleInputEvent.bind(this));
            this.inputElement.addEventListener('focus', this.handleFocusEvent.bind(this));
            this.inputElement.addEventListener('blur', this.handleBlurEvent.bind(this));
            this.inputElement.addEventListener('click', this.handleClickEvent.bind(this));

            if (this.inputElement.form) {
                this.inputElement.form.addEventListener('submit', this.handleFormSubmission.bind(this));
            }
        }

        attachInternalListeners() {
            this.eventBus.listen('apiInitiateQuery', this.initiateSearchOperation.bind(this));
            this.eventBus.listen('apiPurgeDataStore', () => this.dataStorage.clear());
            this.eventBus.listen('apiConfigure', (newSettings) => {
                this.config = extendDeep(this.config, newSettings);
                if ('sourceData' in newSettings && !this.config.remoteUrl) {
                    this.dataStorage.initializeLocalData();
                }
            });
            this.eventBus.listen('apiDeactivate', this.deactivate.bind(this));
        }

        // --- Event Handlers ---
        handleKeyDownEvent(event) {
            this.lastKeyPressed = event.key;
            switch (event.key) {
                case TriggerKeys.UP:
                    event.preventDefault();
                    if (this.suggestionRenderer.isRevealed()) {
                        this.suggestionRenderer.navigateUp();
                    } else {
                        this.triggerInputProcessing(true);
                    }
                    break;
                case TriggerKeys.DOWN:
                    event.preventDefault();
                    if (this.suggestionRenderer.isRevealed()) {
                        this.suggestionRenderer.navigateDown();
                    } else {
                        this.triggerInputProcessing(true);
                    }
                    break;
                case TriggerKeys.PAGE_UP:
                    event.preventDefault();
                    if (this.suggestionRenderer.isRevealed()) {
                        this.suggestionRenderer.pageUp();
                    } else {
                        this.triggerInputProcessing(true);
                    }
                    break;
                case TriggerKeys.PAGE_DOWN:
                    event.preventDefault();
                    if (this.suggestionRenderer.isRevealed()) {
                        this.suggestionRenderer.pageDown();
                    } else {
                        this.triggerInputProcessing(true);
                    }
                    break;
                case TriggerKeys.TAB:
                case TriggerKeys.ENTER:
                    if (this.processSelection()) {
                        event.preventDefault();
                    }
                    break;
                case TriggerKeys.ESCAPE:
                    this.suggestionRenderer.conceal();
                    break;
                default:
                    clearTimeout(this.searchTimer);
                    this.searchTimer = setTimeout(() => this.triggerInputProcessing(), this.config.queryDelay);
                    break;
            }
        }

        handleInputEvent() {
            if (this.lastKeyPressed === TriggerKeys.DEL || this.lastKeyPressed === TriggerKeys.BACKSPACE) {
                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => this.triggerInputProcessing(), this.config.queryDelay);
            }
        }

        handleFocusEvent() {
            this.inputFocusCount++;
        }

        handleBlurEvent() {
            this.inputFocusCount = 0;
            if (!this.mouseSelectionState.isMouseSelecting) {
                this.delayConcealSuggestions();
            }
        }

        handleClickEvent() {
            if (this.inputFocusCount > 1 && !this.suggestionRenderer.isRevealed()) {
                this.triggerInputProcessing(true);
            }
        }

        handleFormSubmission(event) {
            if ((this.lastKeyPressed === TriggerKeys.ENTER || this.lastKeyPressed === TriggerKeys.TAB) &&
                this.suggestionRenderer.isRevealed() && this.suggestionRenderer.getCurrentSelection()) {
                event.preventDefault();
                return false;
            }
        }

        // --- Core Logic ---
        triggerInputProcessing(bypassPreviousCheck = false) {
            if (this.lastKeyPressed === TriggerKeys.DEL) {
                this.suggestionRenderer.conceal();
                return;
            }

            const currentContent = this.inputElement.value;

            if (!bypassPreviousCheck && currentContent === this.previousInputValue) {
                return;
            }

            this.previousInputValue = currentContent;

            const activeQuerySegment = this.config.multiEntryMode ? this.extractLastSegment(currentContent) : currentContent;

            if (activeQuerySegment.length >= this.config.minimumChars) {
                this.inputElement.classList.add(this.config.loadingIndicatorClass);
                if (!this.config.caseInsensitive) {
                    activeQuerySegment = activeQuerySegment.toLowerCase();
                }
                this.fetchAndDisplay(activeQuerySegment, this.receiveData.bind(this), this.immediatelyConcealSuggestions.bind(this));
            } else {
                this.removeLoadingIndicator();
                this.suggestionRenderer.conceal();
            }
        }

        fetchAndDisplay(query, successHandler, errorHandler) {
            let retrievedFromCache = null;
            if (!this.config.remoteUrl) { // Only use cache for local data source
                retrievedFromCache = this.dataStorage.fetch(query);
            }

            if (retrievedFromCache && retrievedFromCache.length) {
                successHandler(query, retrievedFromCache);
            } else if (this.config.remoteUrl) {
                this.dispatchRemoteRequest(query, successHandler, errorHandler);
            } else {
                this.suggestionRenderer.conceal();
                errorHandler(query);
            }
        }

        dispatchRemoteRequest(query, successHandler, errorHandler) {
            if (this.currentAbortController) {
                this.currentAbortController.abort();
            }
            this.currentAbortController = new AbortController();
            const requestSignal = this.currentAbortController.signal;

            const requestPayload = {
                q: this.config.multiEntryMode ? this.extractLastSegment(query) : query,
                limit: this.config.maximumSuggestions
            };

            for (const key in this.config.additionalParameters) {
                if (Object.prototype.hasOwnProperty.call(this.config.additionalParameters, key)) {
                    requestPayload[key] = typeof this.config.additionalParameters[key] === 'function' ?
                        this.config.additionalParameters[key]() :
                        this.config.additionalParameters[key];
                }
            }

            const requestUrl = new URL(this.config.remoteUrl);
            for (const key in requestPayload) {
                requestUrl.searchParams.append(key, requestPayload[key]);
            }

            fetch(requestUrl.toString(), {
                method: 'GET',
                headers: {
                    'Accept': this.config.responseDataType === 'json' ? 'application/json' : 'text/plain'
                },
                signal: requestSignal
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                return this.config.responseDataType === 'json' ? response.json() : response.text();
            })
            .then(data => {
                const parsedResult = this.config.responseParser ? this.config.responseParser(data) : this.defaultResponseParser(data);
                if (this.config.dataCacheLimit > 0) {
                    this.dataStorage.store(query, parsedResult);
                }
                successHandler(query, parsedResult);
            })
            .catch(error => {
                if (error.name === 'AbortError') {
                    // Request was intentionally aborted
                } else {
                    console.error("SuggestMaster: Remote data retrieval failed:", error);
                    errorHandler(query);
                }
            })
            .finally(() => {
                this.removeLoadingIndicator();
                this.currentAbortController = null;
            });
        }

        defaultResponseParser(rawData) {
            if (this.config.responseDataType === 'json') {
                if (Array.isArray(rawData)) {
                    return rawData.map(item => ({
                        originalData: item,
                        displayValue: item[0] || item.value || item,
                        selectedOutput: this.config.resultFormatter ? this.config.resultFormatter(item) : (item[0] || item.value || item)
                    }));
                } else if (rawData && rawData.results && Array.isArray(rawData.results)) {
                    return rawData.results.map(item => ({
                        originalData: item,
                        displayValue: item[0] || item.value || item,
                        selectedOutput: this.config.resultFormatter ? this.config.resultFormatter(item) : (item[0] || item.value || item)
                    }));
                }
                return [];
            } else { // text
                const processedEntries = [];
                const lines = String(rawData).split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const line = removeWhitespace(lines[i]);
                    if (line) {
                        const parts = line.split("|");
                        processedEntries.push({
                            originalData: parts,
                            displayValue: parts[0],
                            selectedOutput: this.config.resultFormatter ? this.config.resultFormatter(parts, parts[0]) : parts[0]
                        });
                    }
                }
                return processedEntries;
            }
        }

        receiveData(query, items) {
            if (items && items.length && this.inputFocusCount) {
                this.removeLoadingIndicator();
                this.suggestionRenderer.update(items, query);
                this.autoFillInputField(query, items[0].displayValue);
                this.suggestionRenderer.positionAndReveal();
            } else {
                this.immediatelyConcealSuggestions();
            }
        }

        processSelection() {
            const chosenItem = this.suggestionRenderer.getCurrentSelection();
            if (!chosenItem) {
                return false;
            }

            let finalContent = chosenItem.selectedOutput;
            this.previousInputValue = finalContent;

            if (this.config.multiEntryMode) {
                let currentSegments = this.parseSegments(this.inputElement.value);
                if (currentSegments.length > 1) {
                    finalContent = currentSegments.slice(0, currentSegments.length - 1).join(this.config.multiEntrySeparator) + this.config.multiEntrySeparator + finalContent;
                }
                finalContent += this.config.multiEntrySeparator;
            }

            this.inputElement.value = finalContent;
            this.immediatelyConcealSuggestions();
            this.emitSelectionEvent(chosenItem.originalData, chosenItem.selectedOutput);
            return true;
        }

        emitSelectionEvent(originalPayload, selectedValue) {
            this.eventBus.notify('selectionMade', { originalPayload, selectedValue });
            this.inputElement.dispatchEvent(new CustomEvent('suggestmaster:selection', {
                detail: { originalPayload, selectedValue },
                bubbles: true
            }));
        }

        // --- Helper Functions ---
        parseSegments(value) {
            if (!value) return [""];
            const segments = value.split(this.config.multiEntrySeparator);
            return segments.map(s => removeWhitespace(s)).filter(s => s.length > 0);
        }

        extractLastSegment(value) {
            if (!this.config.multiEntryMode) return value;
            const segments = this.parseSegments(value);
            return segments[segments.length - 1] || '';
        }

        autoFillInputField(query, suggestionValue) {
            if (this.config.autoFillInput &&
                (this.extractLastSegment(this.inputElement.value).toLowerCase() === query.toLowerCase()) &&
                this.lastKeyPressed !== TriggerKeys.BACKSPACE &&
                this.lastKeyPressed !== TriggerKeys.DEL) {

                const currentFullContent = this.inputElement.value;
                const lastSegmentStart = currentFullContent.lastIndexOf(this.extractLastSegment(this.previousInputValue));
                const segmentPrefix = currentFullContent.substring(0, lastSegmentStart);

                const autoFilledPortion = suggestionValue.substring(this.extractLastSegment(this.previousInputValue).length);
                this.inputElement.value = currentFullContent + autoFilledPortion;

                adjustCursorPosition(this.inputElement, currentFullContent.length, this.inputElement.value.length);
            }
        }

        delayConcealSuggestions() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(this.immediatelyConcealSuggestions.bind(this), 200);
        }

        immediatelyConcealSuggestions() {
            const wasVisible = this.suggestionRenderer.isRevealed();
            this.suggestionRenderer.conceal();
            clearTimeout(this.searchTimer);
            this.removeLoadingIndicator();

            if (this.config.requireMatch) {
                this.initiateSearchOperation((foundResult) => {
                    if (!foundResult) {
                        if (this.config.multiEntryMode) {
                            const segments = this.parseSegments(this.inputElement.value).slice(0, -1);
                            this.inputElement.value = segments.join(this.config.multiEntrySeparator) + (segments.length ? this.config.multiEntrySeparator : "");
                        } else {
                            this.inputElement.value = "";
                        }
                    }
                });
            }
            if (wasVisible) {
                adjustCursorPosition(this.inputElement, this.inputElement.value.length, this.inputElement.value.length);
            }
        }

        removeLoadingIndicator() {
            this.inputElement.classList.remove(this.config.loadingIndicatorClass);
        }

        // --- Public API Methods (renamed to avoid original identifiers) ---
        onSuggestionSelect(callback) {
            this.eventBus.listen('selectionMade', callback);
        }

        initiateSearchOperation(callback) {
            const contentToSearch = this.inputElement.value;
            const segments = this.parseSegments(contentToSearch);
            let resultFound = null;

            const searchNextSegment = (index) => {
                if (index >= segments.length) {
                    if (callback) callback(resultFound);
                    return;
                }
                const segment = segments[index];
                this.fetchAndDisplay(segment, (q, data) => {
                    if (data && data.length) {
                        resultFound = data.find(item => item.displayValue.toLowerCase() === q.toLowerCase());
                    }
                    searchNextSegment(index + 1);
                }, () => {
                    searchNextSegment(index + 1);
                });
            };
            searchNextSegment(0);
        }

        purgeDataStore() {
            this.eventBus.notify('apiPurgeDataStore');
        }

        configure(newOptions) {
            this.eventBus.notify('apiConfigure', newOptions);
        }

        deactivate() {
            this.suggestionRenderer.destroy();
            this.inputElement.removeEventListener('keydown', this.handleKeyDownEvent);
            this.inputElement.removeEventListener('input', this.handleInputEvent);
            this.inputElement.removeEventListener('focus', this.handleFocusEvent);
            this.inputElement.removeEventListener('blur', this.handleBlurEvent);
            this.inputElement.removeEventListener('click', this.handleClickEvent);
            if (this.inputElement.form) {
                this.inputElement.form.removeEventListener('submit', this.handleFormSubmission);
            }
            this.inputElement.classList.remove(this.config.inputFieldClass);
            this.inputElement.removeAttribute('autocomplete');

            clearTimeout(this.searchTimer);
            if (this.currentAbortController) {
                this.currentAbortController.abort();
            }
            this.eventBus.clearAllListeners();
        }
    }

    return SearchPrompt;

})();