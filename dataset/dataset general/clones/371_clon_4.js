function getCaretPosition(inputElement) {
    if ('selectionStart' in inputElement) {
        return {
            start: inputElement.selectionStart,
            end: inputElement.selectionEnd
        };
    } else if (document.selection) {
        inputElement.focus();
        const selection = document.selection.createRange();
        const range = inputElement.createTextRange();
        const bookmark = selection.getBookmark();
        range.moveToBookmark(bookmark);
        const end = range.text.length;
        range.collapse(true);
        range.moveEnd('character', inputElement.value.length);
        const start = range.text.length - selection.text.length;
        return {
            start: start,
            end: end
        };
    }
    return {
        start: 0,
        end: 0
    };
}

function setCaretPosition(inputElement, start, end) {
    if (inputElement.setSelectionRange) {
        inputElement.focus();
        inputElement.setSelectionRange(start, end);
    } else if (inputElement.createTextRange) {
        const range = inputElement.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    }
}

function mergeObjects(...objects) {
    const output = {};
    for (const obj of objects) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                output[key] = obj[key];
            }
        }
    }
    return output;
}

function safeTrim(str) {
    return str == null ? '' : String(str).trim();
}

class ResultVault {
    constructor(preferences) {
        this.dataRegistry = new Map();
        this.capacity = preferences.recordCapacity || 100;
        this.queryQueue = [];
    }

    retrieve(queryKey) {
        const normalizedKey = this.normalizeKey(queryKey);
        if (this.dataRegistry.has(normalizedKey)) {
            this.queryQueue = this.queryQueue.filter(q => q !== normalizedKey);
            this.queryQueue.push(normalizedKey);
            return this.dataRegistry.get(normalizedKey);
        }
        return null;
    }

    deposit(queryKey, payload) {
        const normalizedKey = this.normalizeKey(queryKey);
        if (!this.dataRegistry.has(normalizedKey)) {
            if (this.queryQueue.length >= this.capacity) {
                const oldestKey = this.queryQueue.shift();
                this.dataRegistry.delete(oldestKey);
            }
            this.queryQueue.push(normalizedKey);
        }
        this.dataRegistry.set(normalizedKey, payload);
    }

    purge() {
        this.dataRegistry.clear();
        this.queryQueue = [];
    }

    seed(initialData) {
        if (Array.isArray(initialData)) {
            this.purge();
            initialData.forEach(item => {
                this.deposit(item.value.toLowerCase(), [item]);
            });
        }
    }

    normalizeKey(key) {
        return safeTrim(key).toLowerCase();
    }
}

class SuggestionDisplay {
    constructor(cfg, inputElement, selectionCallback, interactionConfig) {
        this.configuration = cfg;
        this.inputTarget = inputElement;
        this.onSelectionConfirmed = selectionCallback;
        this.interactionSettings = interactionConfig;

        this.displayContainer = document.createElement('div');
        this.displayContainer.className = this.configuration.displayClass;
        this.displayContainer.style.position = 'absolute';
        this.displayContainer.style.display = 'none';
        this.displayContainer.style.zIndex = '9999';

        this.suggestionList = document.createElement('ul');
        this.suggestionList.className = this.configuration.listClass;
        this.displayContainer.appendChild(this.suggestionList);

        document.body.appendChild(this.displayContainer);

        this.currentItems = [];
        this.activeIndex = -1;
        this.isCurrentlyVisible = false;

        this.attachListeners();
        this.adjustPosition();
    }

    attachListeners() {
        this.suggestionList.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.suggestionList.addEventListener('click', this.handleMouseClick.bind(this));
        window.addEventListener('resize', this.adjustPosition.bind(this));
    }

    adjustPosition() {
        const inputRect = this.inputTarget.getBoundingClientRect();
        this.displayContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
        this.displayContainer.style.left = `${inputRect.left + window.scrollX}px`;
        this.displayContainer.style.width = `${this.configuration.displayWidth || inputRect.width}px`;

        if (this.configuration.canScroll && this.configuration.scrollDimension) {
            this.suggestionList.style.maxHeight = `${this.configuration.scrollDimension}px`;
            this.suggestionList.style.overflowY = 'auto';
        }
    }

    showSuggestions(items, currentQuery) {
        this.currentItems = items;
        this.suggestionList.innerHTML = '';
        this.activeIndex = -1;

        if (!items || items.length === 0) {
            this.hideSuggestions();
            return;
        }

        const fragment = document.createDocumentFragment();
        items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-index', index);
            listItem.className = this.configuration.itemClass;
            listItem.innerHTML = this.configuration.formatter(item, currentQuery);
            fragment.appendChild(listItem);
        });
        this.suggestionList.appendChild(fragment);

        this.highlightItem(this.configuration.selectInitial ? 0 : -1);
        this.displayContainer.style.display = 'block';
        this.isCurrentlyVisible = true;
        this.adjustPosition();
    }

    hideSuggestions() {
        this.displayContainer.style.display = 'none';
        this.isCurrentlyVisible = false;
        this.activeIndex = -1;
        this.currentItems = [];
        this.suggestionList.innerHTML = '';
    }

    isVisible() {
        return this.isCurrentlyVisible;
    }

    highlightItem(index) {
        if (this.activeIndex !== -1) {
            const prevActive = this.suggestionList.children[this.activeIndex];
            if (prevActive) {
                prevActive.classList.remove(this.configuration.activeClass);
            }
        }

        if (index >= 0 && index < this.currentItems.length) {
            this.activeIndex = index;
            const newActive = this.suggestionList.children[this.activeIndex];
            if (newActive) {
                newActive.classList.add(this.configuration.activeClass);
                if (this.configuration.canScroll && this.configuration.scrollSnap) {
                    this.scrollIntoView(newActive);
                }
            }
        } else {
            this.activeIndex = -1;
        }
    }

    scrollIntoView(element) {
        const listTop = this.suggestionList.scrollTop;
        const listBottom = listTop + this.suggestionList.clientHeight;
        const elemTop = element.offsetTop;
        const elemBottom = elemTop + element.offsetHeight;

        if (elemTop < listTop) {
            this.suggestionList.scrollTop = elemTop;
        } else if (elemBottom > listBottom) {
            this.suggestionList.scrollTop = elemBottom - this.suggestionList.clientHeight;
        }
    }

    moveSelection(direction) {
        if (!this.isVisible() || this.currentItems.length === 0) return;

        let newIndex = this.activeIndex;
        if (direction === -1) {
            newIndex = (this.activeIndex === -1 || this.activeIndex === 0) ? this.currentItems.length - 1 : this.activeIndex - 1;
        } else if (direction === 1) {
            newIndex = (this.activeIndex === -1 || this.activeIndex === this.currentItems.length - 1) ? 0 : this.activeIndex + 1;
        } else if (direction === -10) {
            newIndex = Math.max(0, this.activeIndex - Math.floor(this.suggestionList.clientHeight / (this.suggestionList.children[0]?.offsetHeight || 1)));
        } else if (direction === 10) {
            newIndex = Math.min(this.currentItems.length - 1, this.activeIndex + Math.floor(this.suggestionList.clientHeight / (this.suggestionList.children[0]?.offsetHeight || 1)));
        }

        this.highlightItem(newIndex);
        return true;
    }

    getCurrentSelection() {
        if (this.activeIndex !== -1 && this.currentItems.length > 0) {
            return this.currentItems[this.activeIndex];
        }
        return null;
    }

    handleMouseOver(event) {
        const listItem = event.target.closest('li');
        if (listItem && this.suggestionList.contains(listItem)) {
            const index = parseInt(listItem.getAttribute('data-index'), 10);
            this.highlightItem(index);
        }
    }

    handleMouseClick(event) {
        this.interactionSettings.isMouseDown = true;
        const listItem = event.target.closest('li');
        if (listItem && this.suggestionList.contains(listItem)) {
            const selectedItem = this.getCurrentSelection();
            if (selectedItem) {
                this.onSelectionConfirmed(selectedItem);
            }
        }
        setTimeout(() => {
            this.interactionSettings.isMouseDown = false;
        }, 150);
    }

    detach() {
        this.hideSuggestions();
        this.displayContainer.remove();
        window.removeEventListener('resize', this.adjustPosition.bind(this));
    }
}

class TypeaheadWidget {
    constructor(targetInput, userConfiguration) {
        this.entryTarget = targetInput;
        this.widgetSettings = mergeObjects(TypeaheadWidget.defaultSettings, userConfiguration);

        this.entryTarget.setAttribute('autocomplete', 'off');
        this.entryTarget.classList.add(this.widgetSettings.inputStyling);

        this.activityTimer = null;
        this.lastEntryValue = '';
        this.focusedCount = 0;
        this.lastKeyCodePressed = null;
        this.isMouseInteractingWithDisplay = {
            isMouseDown: false
        };

        this.dataVault = new ResultVault(this.widgetSettings);
        if (this.widgetSettings.initialData) {
            this.dataVault.seed(this.widgetSettings.initialData);
        }

        this.suggestionDisplay = new SuggestionDisplay({
            displayClass: this.widgetSettings.resultsStyling,
            listClass: this.widgetSettings.listStyling,
            itemClass: this.widgetSettings.itemStyling,
            activeClass: this.widgetSettings.activeStyling,
            formatter: this.widgetSettings.resultFormatter,
            selectInitial: this.widgetSettings.autoSelectFirst,
            displayWidth: this.widgetSettings.displayMaxWidth,
            canScroll: this.widgetSettings.enableScrolling,
            scrollDimension: this.widgetSettings.scrollDimension,
            scrollSnap: this.widgetSettings.scrollSnapPosition
        }, this.entryTarget, this.confirmHighlightedSelection.bind(this), this.isMouseInteractingWithDisplay);

        this.boundListeners = {};
        this.setupEventHandlers();
        this.preventFormSubmission = false;

        if (navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window)) {
            this.entryTarget.form?.addEventListener('submit', this.handleFormSubmit.bind(this), {
                capture: true
            });
        }
    }

    setupEventHandlers() {
        const inputEventName = (navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window)) ? "keypress" : "keydown";
        this.boundListeners.inputKeyHandler = this.handleInputKey.bind(this);
        this.entryTarget.addEventListener(inputEventName, this.boundListeners.inputKeyHandler);

        this.boundListeners.inputFocusHandler = this.handleInputFocus.bind(this);
        this.entryTarget.addEventListener('focus', this.boundListeners.inputFocusHandler);

        this.boundListeners.inputBlurHandler = this.handleInputBlur.bind(this);
        this.entryTarget.addEventListener('blur', this.boundListeners.inputBlurHandler);

        this.boundListeners.inputClickHandler = this.handleInputClick.bind(this);
        this.entryTarget.addEventListener('click', this.boundListeners.inputClickHandler);

        this.boundListeners.customSearchHandler = this.executeSearch.bind(this);
        this.entryTarget.addEventListener('typeahead:search', this.boundListeners.customSearchHandler);

        this.boundListeners.customFlushHandler = this.purgeDataStore.bind(this);
        this.entryTarget.addEventListener('typeahead:flush', this.boundListeners.customFlushHandler);

        this.boundListeners.customOptionsHandler = this.updateConfiguration.bind(this);
        this.entryTarget.addEventListener('typeahead:setOptions', this.boundListeners.customOptionsHandler);

        this.boundListeners.customUnbindHandler = this.destroyWidget.bind(this);
        this.entryTarget.addEventListener('typeahead:unbind', this.boundListeners.customUnbindHandler);
    }

    handleFormSubmit(event) {
        if (this.preventFormSubmission) {
            event.preventDefault();
            this.preventFormSubmission = false;
        }
    }

    handleInputKey(event) {
        this.focusedCount++;
        this.lastKeyCodePressed = event.keyCode;

        const KEY_MAP = TypeaheadWidget.KEY_MAP;

        switch (event.keyCode) {
            case KEY_MAP.ARROW_UP:
                if (this.suggestionDisplay.isVisible()) {
                    event.preventDefault();
                    this.suggestionDisplay.moveSelection(-1);
                } else {
                    this.evaluateInputContent(true);
                }
                break;
            case KEY_MAP.ARROW_DOWN:
                if (this.suggestionDisplay.isVisible()) {
                    event.preventDefault();
                    this.suggestionDisplay.moveSelection(1);
                } else {
                    this.evaluateInputContent(true);
                }
                break;
            case KEY_MAP.PAGE_UP:
                if (this.suggestionDisplay.isVisible()) {
                    event.preventDefault();
                    this.suggestionDisplay.moveSelection(-10);
                } else {
                    this.evaluateInputContent(true);
                }
                break;
            case KEY_MAP.PAGE_DOWN:
                if (this.suggestionDisplay.isVisible()) {
                    event.preventDefault();
                    this.suggestionDisplay.moveSelection(10);
                } else {
                    this.evaluateInputContent(true);
                }
                break;
            case KEY_MAP.TAB:
            case KEY_MAP.ENTER:
                const isCommaSeparator = this.widgetSettings.allowMultiple && safeTrim(this.widgetSettings.multiSeparator) === ',' && event.keyCode === KEY_MAP.COMMA;
                if (this.confirmHighlightedSelection() || isCommaSeparator) {
                    event.preventDefault();
                    this.preventFormSubmission = true;
                    return false;
                }
                break;
            case KEY_MAP.ESCAPE:
                this.suggestionDisplay.hideSuggestions();
                break;
            default:
                clearTimeout(this.activityTimer);
                this.activityTimer = setTimeout(() => this.evaluateInputContent(), this.widgetSettings.queryDelay);
                break;
        }
    }

    handleInputFocus() {
        this.focusedCount++;
    }

    handleInputBlur() {
        this.focusedCount = 0;
        if (!this.isMouseInteractingWithDisplay.isMouseDown) {
            this.concealSuggestionsAfterDelay();
        }
    }

    handleInputClick() {
        if (this.widgetSettings.fireOnClick || (this.focusedCount > 1 && !this.suggestionDisplay.isVisible())) {
            this.evaluateInputContent(true);
        }
    }

    confirmHighlightedSelection() {
        const chosen = this.suggestionDisplay.getCurrentSelection();
        if (!chosen) {
            return false;
        }

        let finalValue = chosen.displayValue;
        this.lastEntryValue = finalValue;

        if (this.widgetSettings.allowMultiple) {
            let segments = this.dissectPhrase(this.entryTarget.value);
            if (segments.length > 1) {
                const separatorLength = this.widgetSettings.multiSeparator.length;
                const caretPos = getCaretPosition(this.entryTarget).start;
                let segmentIdx = -1;
                let progress = 0;
                for (let i = 0; i < segments.length; i++) {
                    progress += segments[i].length;
                    if (caretPos <= progress) {
                        segmentIdx = i;
                        break;
                    }
                    progress += separatorLength;
                }
                if (segmentIdx !== -1) {
                    segments[segmentIdx] = finalValue;
                }
                finalValue = segments.join(this.widgetSettings.multiSeparator);
            }
            finalValue += this.widgetSettings.multiSeparator;
        }

        this.entryTarget.value = finalValue;
        this.hideSuggestionsImmediately();
        this.dispatchCustomEvent('typeahead:outcome', {
            data: chosen.rawData,
            value: chosen.actualValue
        });
        return true;
    }

    evaluateInputContent(skipPreviousCheck = false) {
        if (this.lastKeyCodePressed === TypeaheadWidget.KEY_MAP.DELETE) {
            this.suggestionDisplay.hideSuggestions();
            return;
        }

        const currentInput = this.entryTarget.value;

        if (!skipPreviousCheck && currentInput === this.lastEntryValue) {
            return;
        }

        this.lastEntryValue = currentInput;

        const processedTerm = this.extractTrailingWord(currentInput);
        if (processedTerm.length >= this.widgetSettings.minimumCharacters) {
            this.entryTarget.classList.add(this.widgetSettings.loadingStyling);
            const queryTerm = this.widgetSettings.caseSensitiveMatch ? processedTerm : processedTerm.toLowerCase();
            this.queryDataSource(queryTerm, this.processFetchedData.bind(this), this.hideSuggestionsImmediately.bind(this));
        } else {
            this.stopLoadingIndicator();
            this.suggestionDisplay.hideSuggestions();
        }
    }

    dissectPhrase(phrase) {
        if (!phrase) return [''];
        if (!this.widgetSettings.allowMultiple) return [safeTrim(phrase)];

        return phrase.split(this.widgetSettings.multiSeparator).map(word => safeTrim(word)).filter(word => word.length > 0);
    }

    extractTrailingWord(phrase) {
        if (!this.widgetSettings.allowMultiple) return phrase;
        const segments = this.dissectPhrase(phrase);
        if (segments.length === 0) return '';
        if (segments.length === 1) return segments[0];

        const caretPos = getCaretPosition(this.entryTarget).start;
        if (caretPos === phrase.length) {
            return segments[segments.length - 1];
        } else {
            let currentProgress = 0;
            for (let i = 0; i < segments.length; i++) {
                currentProgress += segments[i].length;
                if (caretPos <= currentProgress) {
                    return segments[i];
                }
                currentProgress += this.widgetSettings.multiSeparator.length;
            }
        }
        return '';
    }

    autoCompleteText(query, bestMatchValue) {
        if (this.widgetSettings.enableAutoFill &&
            (this.extractTrailingWord(this.entryTarget.value).toLowerCase() === query.toLowerCase()) &&
            this.lastKeyCodePressed !== TypeaheadWidget.KEY_MAP.BACKSPACE) {

            const currentSegment = this.extractTrailingWord(this.lastEntryValue);
            const remainingText = bestMatchValue.substring(currentSegment.length);
            this.entryTarget.value = this.entryTarget.value + remainingText;
            setCaretPosition(this.entryTarget, this.entryTarget.value.length - remainingText.length, this.entryTarget.value.length);
        }
    }

    concealSuggestionsAfterDelay() {
        clearTimeout(this.activityTimer);
        this.activityTimer = setTimeout(() => this.hideSuggestionsImmediately(), this.widgetSettings.hideDelay);
    }

    hideSuggestionsImmediately() {
        const wasVisible = this.suggestionDisplay.isVisible();
        this.suggestionDisplay.hideSuggestions();
        clearTimeout(this.activityTimer);
        this.stopLoadingIndicator();

        if (this.widgetSettings.requireMatch && wasVisible) {
            this.executeSearch((result) => {
                if (!result) {
                    if (this.widgetSettings.allowMultiple) {
                        const words = this.dissectPhrase(this.entryTarget.value).slice(0, -1);
                        this.entryTarget.value = words.join(this.widgetSettings.multiSeparator) + (words.length ? this.widgetSettings.multiSeparator : "");
                    } else {
                        this.entryTarget.value = "";
                        this.dispatchCustomEvent('typeahead:outcome', null);
                    }
                }
            });
        }
    }

    processFetchedData(query, records) {
        if (records && records.length && this.focusedCount > 0) {
            this.stopLoadingIndicator();
            this.suggestionDisplay.showSuggestions(records, query);
            this.autoCompleteText(query, records[0].displayValue);
        } else {
            this.hideSuggestionsImmediately();
        }
    }

    queryDataSource(searchTerm, successCallback, failureCallback) {
        if (!this.widgetSettings.caseSensitiveMatch) {
            searchTerm = searchTerm.toLowerCase();
        }

        const cachedResult = this.dataVault.retrieve(searchTerm);

        if (cachedResult) {
            if (cachedResult.length > 0) {
                successCallback(searchTerm, cachedResult);
            } else {
                const parsedNoRecord = this.widgetSettings.responseParser ?
                    this.widgetSettings.responseParser(this.widgetSettings.noRecordMessage) :
                    this.defaultResponseParser(this.widgetSettings.noRecordMessage);
                successCallback(searchTerm, parsedNoRecord);
            }
        } else if (typeof this.widgetSettings.sourceURL === "string" && this.widgetSettings.sourceURL.length > 0) {
            this.performRemoteRequest(searchTerm, successCallback, failureCallback);
        } else {
            this.suggestionDisplay.hideSuggestions();
            if (typeof this.widgetSettings.onQueryFailure === "function") {
                this.widgetSettings.onQueryFailure();
            } else {
                failureCallback(searchTerm);
            }
        }
    }

    performRemoteRequest(searchTerm, successCallback, failureCallback) {
        const requestParams = {
            query: this.extractTrailingWord(searchTerm),
            limit: this.widgetSettings.maxRecords,
            _t: new Date().getTime()
        };

        for (const key in this.widgetSettings.additionalParams) {
            if (Object.prototype.hasOwnProperty.call(this.widgetSettings.additionalParams, key)) {
                const param = this.widgetSettings.additionalParams[key];
                requestParams[key] = typeof param === "function" ? param() : param;
            }
        }

        const url = new URL(this.widgetSettings.sourceURL);
        for (const key in requestParams) {
            url.searchParams.append(key, requestParams[key]);
        }

        fetch(url.toString(), {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const parsedData = this.widgetSettings.responseParser ?
                    this.widgetSettings.responseParser(data) :
                    this.defaultResponseParser(data);
                this.dataVault.deposit(searchTerm, parsedData);
                successCallback(searchTerm, parsedData);
            })
            .catch(error => {
                console.error("Typeahead fetch error:", error);
                if (typeof this.widgetSettings.onQueryFailure === "function") {
                    this.widgetSettings.onQueryFailure();
                } else {
                    failureCallback(searchTerm);
                }
            });
    }

    defaultResponseParser(rawData) {
        const structured = [];
        const lines = rawData.split("\n");
        for (const line of lines) {
            const trimmedLine = safeTrim(line);
            if (trimmedLine) {
                const parts = trimmedLine.split("|");
                structured.push({
                    rawData: parts,
                    actualValue: parts[0],
                    displayValue: this.widgetSettings.resultFormatter ? this.widgetSettings.resultFormatter(parts, parts[0]) : parts[0]
                });
            }
        }
        return structured;
    }

    stopLoadingIndicator() {
        this.entryTarget.classList.remove(this.widgetSettings.loadingStyling);
    }

    onSelection(callback) {
        this.entryTarget.addEventListener('typeahead:outcome', (event) => {
            if (event.detail) {
                callback(event.detail.data, event.detail.value);
            } else {
                callback(null, null);
            }
        });
    }

    executeSearch(callback = null) {
        const queryTerm = this.extractTrailingWord(this.entryTarget.value);
        const searchCallback = (q, data) => {
            let foundResult = null;
            if (data && data.length) {
                for (const item of data) {
                    if (item.actualValue.toLowerCase() === queryTerm.toLowerCase()) {
                        foundResult = item;
                        break;
                    }
                }
            }
            if (typeof callback === "function") {
                callback(foundResult);
            } else {
                this.dispatchCustomEvent('typeahead:outcome', foundResult ? {
                    data: foundResult.rawData,
                    value: foundResult.actualValue
                } : null);
            }
        };
        this.queryDataSource(queryTerm, searchCallback, searchCallback);
    }

    purgeDataStore() {
        this.dataVault.purge();
    }

    updateConfiguration(newSettings) {
        this.widgetSettings = mergeObjects(this.widgetSettings, newSettings);
        if ('initialData' in newSettings) {
            this.dataVault.seed(newSettings.initialData);
        }
    }

    destroyWidget() {
        const inputEventName = (navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window)) ? "keypress" : "keydown";
        this.entryTarget.removeEventListener(inputEventName, this.boundListeners.inputKeyHandler);
        this.entryTarget.removeEventListener('focus', this.boundListeners.inputFocusHandler);
        this.entryTarget.removeEventListener('blur', this.boundListeners.inputBlurHandler);
        this.entryTarget.removeEventListener('click', this.boundListeners.inputClickHandler);

        this.entryTarget.removeEventListener('typeahead:search', this.boundListeners.customSearchHandler);
        this.entryTarget.removeEventListener('typeahead:flush', this.boundListeners.customFlushHandler);
        this.entryTarget.removeEventListener('typeahead:setOptions', this.boundListeners.customOptionsHandler);
        this.entryTarget.removeEventListener('typeahead:unbind', this.boundListeners.customUnbindHandler);

        if (navigator.userAgent.includes("Opera") && !('KeyboardEvent' in window)) {
            this.entryTarget.form?.removeEventListener('submit', this.handleFormSubmit.bind(this), {
                capture: true
            });
        }

        this.suggestionDisplay.detach();

        this.entryTarget.classList.remove(this.widgetSettings.inputStyling);
        this.entryTarget.classList.remove(this.widgetSettings.loadingStyling);
        this.entryTarget.removeAttribute('autocomplete');

        clearTimeout(this.activityTimer);
    }

    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        this.entryTarget.dispatchEvent(event);
    }
}

TypeaheadWidget.defaultSettings = {
    inputStyling: "entry-field-suggest",
    resultsStyling: "suggestion-box",
    listStyling: "suggestion-list",
    itemStyling: "suggestion-item",
    activeStyling: "suggestion-active",
    loadingStyling: "loading-indicator",
    minimumCharacters: 1,
    queryDelay: 400,
    hideDelay: 200,
    caseSensitiveMatch: false,
    subsetMatch: true,
    containsMatch: false,
    recordCapacity: 100,
    maxRecords: 150,
    requireMatch: false,
    additionalParams: {},
    autoSelectFirst: true,
    resultFormatter: (itemData, query) => {
        const term = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\\]/g, "\\$&");
        return String(itemData[0]).replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
    },
    enableAutoFill: false,
    displayMaxWidth: 0,
    allowMultiple: false,
    multiSeparator: " ",
    inputAutoFocus: true,
    fireOnClick: false,
    onQueryFailure: null,
    sourceURL: null,
    initialData: null,
    dataType: 'text',
    noRecordMessage: "No Records.",
    responseParser: null,
    enableScrolling: true,
    scrollDimension: 180,
    scrollSnapPosition: true
};

TypeaheadWidget.KEY_MAP = {
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    DELETE: 46,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    COMMA: 188,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    BACKSPACE: 8
};

const EnhancedInputModule = (function() {
    const registry = new Map();

    function getWidgetInstance(element) {
        return registry.get(element);
    }

    const exposedInterface = {
        attachSuggest: function(element, dataSource, customPrefs) {
            if (!(element instanceof HTMLElement)) {
                console.error("Invalid element provided for attachSuggest.");
                return null;
            }
            if (registry.has(element)) {
                registry.get(element).destroyWidget();
                registry.delete(element);
            }

            const mergedPreferences = mergeObjects({}, TypeaheadWidget.defaultSettings, customPrefs);

            const isURL = typeof dataSource === "string";
            mergedPreferences.sourceURL = isURL ? dataSource : null;
            mergedPreferences.initialData = isURL ? null : dataSource;

            if (!isURL) {
                mergedPreferences.queryDelay = (customPrefs && typeof customPrefs.queryDelay !== 'undefined') ? customPrefs.queryDelay : 10;
            }

            if (customPrefs && !customPrefs.enableScrolling && !customPrefs.maxRecords) {
                mergedPreferences.maxRecords = 10;
            } else if (!mergedPreferences.maxRecords) {
                mergedPreferences.maxRecords = 150;
            }
            
            if (!mergedPreferences.resultFormatter) {
                mergedPreferences.resultFormatter = (value) => value[0];
            }

            const instance = new TypeaheadWidget(element, mergedPreferences);
            registry.set(element, instance);
            return instance;
        },

        onResult: function(element, callback) {
            const instance = getWidgetInstance(element);
            if (instance) instance.onSelection(callback);
            return instance;
        },

        initiateSearch: function(element, callback) {
            const instance = getWidgetInstance(element);
            if (instance) instance.executeSearch(callback);
            return instance;
        },

        clearMemory: function(element) {
            const instance = getWidgetInstance(element);
            if (instance) instance.purgeDataStore();
            return instance;
        },

        configureWidget: function(element, newConfig) {
            const instance = getWidgetInstance(element);
            if (instance) instance.updateConfiguration(newConfig);
            return instance;
        },

        detachSuggest: function(element) {
            const instance = getWidgetInstance(element);
            if (instance) {
                instance.destroyWidget();
                registry.delete(element);
            }
            return instance;
        }
    };

    return exposedInterface;
})();