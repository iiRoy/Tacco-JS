class DynamicInputEnhancer {
    static defaultSettings = {
        localFeed: false,
        remoteEndpoint: false,
        noMatchesMessage: false,
        fetchingMessage: 'Fetching data...',
        allowNewEntry: false,
        displayKey: 'name',
        searchKeys: 'name',
        requestParameter: 'q',
        maxSuggestions: false,
        additionalParams: {},
        caseSensitive: false,
        minimumLength: 1,
        inputDelay: 500,
        highlightMatches: true,
        onSelectionMade: (data) => {},
        onOptionFocused: (data) => {},
        formatSuggestionItem: false,
        onBeforeDataFetch: (query) => query,
        onDataFetched: (data, query, isLocal) => data,
        onRenderComplete: () => {}
    };

    #inputElement;
    #suggestionWrapper;
    #outputPanel;
    #suggestionList;

    #currentQueryText = '';
    #debounceID = null;
    #activeFetchPromise = null;
    #currentSearchResults = [];

    #config;

    // Bound event handlers for proper removal
    #boundHandleFocus;
    #boundHandleKeydown;
    #boundHandleBlur;
    #boundHandleResultClick;
    #boundHandleResultMouseover;
    #boundRefreshEnhancer;
    #boundUpdateValueEnhancer;
    #boundReconfigureEnhancer;
    #boundDestroyEnhancer;

    constructor(targetInput, userSettings = {}) {
        if (!(targetInput instanceof HTMLElement)) {
            throw new Error('DynamicInputEnhancer: Target must be an HTMLElement.');
        }
        this.#inputElement = targetInput;
        this.#config = { ...DynamicInputEnhancer.defaultSettings, ...userSettings };
        if (userSettings.additionalParams) {
            this.#config.additionalParams = { ...DynamicInputEnhancer.defaultSettings.additionalParams, ...userSettings.additionalParams };
        }

        this.#bindEventHandlers();
        this.#initializeEnhancer();
    }

    #bindEventHandlers() {
        this.#boundHandleFocus = this.#handleFocus.bind(this);
        this.#boundHandleKeydown = this.#handleKeydown.bind(this);
        this.#boundHandleBlur = this.#handleBlur.bind(this);
        this.#boundHandleResultClick = this.#handleResultClick.bind(this);
        this.#boundHandleResultMouseover = this.#handleResultMouseover.bind(this);
        this.#boundRefreshEnhancer = this.#initiateSearchRefresh.bind(this);
        this.#boundUpdateValueEnhancer = this.#updateInputValue.bind(this);
        this.#boundReconfigureEnhancer = (e) => this.#reconfigure(e.detail);
        this.#boundDestroyEnhancer = this.#destroyEnhancer.bind(this);
    }

    #initializeEnhancer() {
        this.#inputElement.classList.add('enhancer-input');
        const inputID = this.#inputElement.id || `enhancer-input-${Math.random().toString(36).substr(2, 9)}`;
        if (!this.#inputElement.id) {
            this.#inputElement.id = inputID;
        }

        this.#suggestionWrapper = document.createElement('div');
        this.#suggestionWrapper.className = 'suggestion-wrapper';
        this.#suggestionWrapper.id = `suggestion-wrapper-${inputID}`;
        this.#inputElement.parentNode.insertBefore(this.#suggestionWrapper, this.#inputElement);
        this.#suggestionWrapper.appendChild(this.#inputElement);

        this.#outputPanel = document.createElement('div');
        this.#outputPanel.className = 'output-panel';
        this.#outputPanel.id = `output-panel-${inputID}`;
        this.#outputPanel.style.display = 'none';
        this.#suggestionWrapper.parentNode.insertBefore(this.#outputPanel, this.#suggestionWrapper.nextSibling);

        this.#suggestionList = document.createElement('ul');
        this.#suggestionList.className = 'suggestion-list';
        this.#suggestionList.style.width = `${this.#inputElement.offsetWidth}px`;
        this.#outputPanel.appendChild(this.#suggestionList);

        this.#currentQueryText = this.#inputElement.value.trim();

        this.#attachEventHandlers();
    }

    #attachEventHandlers() {
        this.#inputElement.addEventListener('focus', this.#boundHandleFocus);
        this.#inputElement.addEventListener('keydown', this.#boundHandleKeydown);
        this.#inputElement.addEventListener('blur', this.#boundHandleBlur);

        this.#inputElement.addEventListener('refreshEnhancer', this.#boundRefreshEnhancer);
        this.#inputElement.addEventListener('updateValueEnhancer', this.#boundUpdateValueEnhancer);
        this.#inputElement.addEventListener('reconfigureEnhancer', this.#boundReconfigureEnhancer);
        this.#inputElement.addEventListener('destroyEnhancer', this.#boundDestroyEnhancer);

        this.#suggestionList.addEventListener('click', this.#boundHandleResultClick);
        this.#suggestionList.addEventListener('mouseover', this.#boundHandleResultMouseover);
    }

    #handleFocus() {
        if (this.#inputElement.value.trim() !== '') {
            this.#outputPanel.style.display = 'block';
        }
    }

    #handleKeydown(event) {
        const keyEventCode = event.keyCode;

        switch (keyEventCode) {
            case 38: // Up arrow
            case 40: // Down arrow
                event.preventDefault();
                this.#navigateOptions(keyEventCode === 38 ? 'up' : 'down');
                break;
            case 8: // Backspace
                if (this.#inputElement.value.length === 1) {
                    this.#outputPanel.style.display = 'none';
                }
                this.#initiateSearchRefresh();
                break;
            case 9: // Tab
            case 13: // Enter
                const activeItem = this.#suggestionList.querySelector('.active-suggestion');
                if (activeItem) {
                    activeItem.dispatchEvent(new CustomEvent('suggestionSelect', { bubbles: true }));
                    event.preventDefault();
                }
                break;
            case 27: // Esc
                this.#cancelPendingRequest();
                this.#outputPanel.style.display = 'none';
                break;
            default:
                if (keyEventCode === 46 || (keyEventCode > 9 && keyEventCode < 32)) {
                    this.#outputPanel.style.display = 'none';
                } else {
                    this.#initiateSearchRefresh();
                }
                break;
        }
    }

    #handleBlur() {
        setTimeout(() => {
            if (!this.#outputPanel.contains(document.activeElement) && !this.#inputElement.contains(document.activeElement)) {
                 this.#inputElement.value = this.#currentQueryText;
                 this.#outputPanel.style.display = 'none';
            }
        }, 100);
    }

    #handleResultClick(event) {
        let targetItem = event.target.closest('.result-entry');
        if (targetItem) {
            targetItem.dispatchEvent(new CustomEvent('suggestionSelect', { bubbles: true }));
        }
    }

    #handleResultMouseover(event) {
        let targetItem = event.target.closest('.result-entry');
        if (targetItem) {
            this.#suggestionList.querySelectorAll('.active-suggestion').forEach(el => el.classList.remove('active-suggestion'));
            targetItem.classList.add('active-suggestion');
            const itemData = targetItem.dataset.suggestionData ? JSON.parse(targetItem.dataset.suggestionData) : {};
            this.#config.onOptionFocused.call(this.#inputElement, itemData);
        }
    }

    #initiateSearchRefresh() {
        if (this.#debounceID) {
            clearTimeout(this.#debounceID);
        }
        this.#debounceID = setTimeout(() => this.#processInputChanges(), this.#config.inputDelay);
    }

    async #processInputChanges() {
        const currentInputValue = this.#inputElement.value.trim().replace(/[\\]+|[\/]+/g, "").replace(/\s+/g, " ");
        this.#currentQueryText = currentInputValue;

        if (currentInputValue.length >= this.#config.minimumLength) {
            let processedQuery = this.#config.onBeforeDataFetch.call(this.#inputElement, currentInputValue);

            this.#inputElement.classList.add('fetching-status');
            this.#suggestionList.innerHTML = '';
            this.#currentSearchResults = [];
            this.#outputPanel.style.display = 'block';

            let localMatches = [];
            if (this.#config.localFeed) {
                const localProcessedRaw = this.#config.onDataFetched.call(this.#inputElement, this.#config.localFeed, processedQuery, true);
                localMatches = this.#filterAndMapResults(localProcessedRaw, currentInputValue, true);
                this.#renderIncrementalResults(localMatches, currentInputValue);
            }

            if (this.#config.remoteEndpoint) {
                this.#cancelPendingRequest();
                const url = new URL(this.#config.remoteEndpoint);
                url.searchParams.append(this.#config.requestParameter, processedQuery);
                for (const key in this.#config.additionalParams) {
                    url.searchParams.append(key, this.#config.additionalParams[key]);
                }
                const controller = new AbortController();
                this.#activeFetchPromise = controller;

                if (localMatches.length === 0 && this.#config.fetchingMessage) {
                    this.#suggestionList.innerHTML = `<li class="status-note">${this.#config.fetchingMessage}</li>`;
                }

                try {
                    const response = await fetch(url.toString(), { signal: controller.signal });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const remoteRawData = await response.json();
                    this.#activeFetchPromise = null;
                    const remoteMatches = this.#filterAndMapResults(remoteRawData, currentInputValue, false);
                    this.#renderIncrementalResults(remoteMatches, currentInputValue);
                } catch (error) {
                    if (error.name === 'AbortError') {
                        // Request aborted, no error to log unless it's a real network issue
                    } else {
                        console.error('Fetch error:', error);
                    }
                    this.#activeFetchPromise = null;
                }
            }
            this.#finalRenderCleanup(this.#currentSearchResults.length, currentInputValue);

        } else {
            this.#inputElement.classList.remove('fetching-status');
            this.#outputPanel.style.display = 'none';
        }
    }

    #cancelPendingRequest() {
        if (this.#activeFetchPromise && this.#activeFetchPromise instanceof AbortController) {
            this.#activeFetchPromise.abort();
            this.#activeFetchPromise = null;
        }
    }

    #navigateOptions(direction) {
        const visibleItems = Array.from(this.#suggestionList.querySelectorAll('.result-entry:not([style*="display: none"])'));
        if (visibleItems.length === 0) return;

        let currentActive = this.#suggestionList.querySelector('.active-suggestion');
        let nextActive = null;

        if (currentActive) {
            currentActive.classList.remove('active-suggestion');
            const currentIndex = visibleItems.indexOf(currentActive);
            if (direction === 'down') {
                nextActive = visibleItems[(currentIndex + 1) % visibleItems.length];
            } else {
                nextActive = visibleItems[(currentIndex - 1 + visibleItems.length) % visibleItems.length];
            }
        } else {
            nextActive = (direction === 'down') ? visibleItems[0] : visibleItems[visibleItems.length - 1];
        }

        if (nextActive) {
            nextActive.classList.add('active-suggestion');
            const itemData = nextActive.dataset.suggestionData ? JSON.parse(nextActive.dataset.suggestionData) : {};
            this.#config.onOptionFocused.call(this.#inputElement, itemData);
            this.#inputElement.value = itemData[this.#config.displayKey];
        } else {
            this.#inputElement.value = this.#currentQueryText;
        }
    }

    #filterAndMapResults(dataSource, query, isLocalSource) {
        const searchKeysArray = this.#config.searchKeys.split(',').map(key => key.trim());
        let matchCounter = 0;
        let results = [];

        for (let i = 0; i < dataSource.length; i++) {
            const entry = dataSource[i];
            if (this.#config.maxSuggestions && matchCounter >= this.#config.maxSuggestions) {
                break;
            }

            const searchableString = searchKeysArray.map(key => entry[key] || '').join(' ');
            let searchTarget = this.#config.caseSensitive ? searchableString : searchableString.toLowerCase();
            let searchTerms = this.#config.caseSensitive ? query : query.toLowerCase();

            const queryWords = searchTerms.split(' ').filter(word => word.length > 0);
            const isMatched = queryWords.some(word => searchTarget.includes(word));

            if (isMatched) {
                matchCounter++;
                results.push({
                    ...entry,
                    _sourceType: isLocalSource ? 'local' : 'remote',
                    _internalID: matchCounter
                });
            }
        }
        return results;
    }

    #renderIncrementalResults(newFilteredResults, originalQuery) {
        const loadingNote = this.#suggestionList.querySelector('.status-note');
        if (loadingNote && loadingNote.textContent === this.#config.fetchingMessage) {
            loadingNote.remove();
        }

        this.#currentSearchResults.push(...newFilteredResults);

        if (newFilteredResults.length > 0) {
            const fragment = document.createDocumentFragment();
            newFilteredResults.forEach(item => {
                let displayValue = item[this.#config.displayKey];
                let formattedDisplay = displayValue;

                if (this.#config.highlightMatches) {
                    const queryWords = (this.#config.caseSensitive ? originalQuery : originalQuery.toLowerCase()).split(' ').filter(word => word.length > 0);
                    queryWords.forEach(word => {
                        const regex = new RegExp(`(?![^&;]+;)(?!<[^<>]*)(${word})(?![^<>]*>)(?![^&;]+;)`, this.#config.caseSensitive ? 'g' : 'gi');
                        formattedDisplay = formattedDisplay.replace(regex, '<em>$1</em>');
                    });
                }

                const listItem = document.createElement('li');
                listItem.className = 'result-entry';
                listItem.dataset.suggestionData = JSON.stringify(item);

                if (this.#config.formatSuggestionItem) {
                    const customContent = this.#config.formatSuggestionItem.call(this.#inputElement, item, listItem);
                    if (typeof customContent === 'string') {
                        listItem.innerHTML = customContent;
                    } else if (customContent instanceof HTMLElement) {
                        listItem.innerHTML = '';
                        listItem.appendChild(customContent);
                    } else {
                        listItem.innerHTML = formattedDisplay;
                    }
                } else {
                    listItem.innerHTML = formattedDisplay;
                }

                listItem.addEventListener('suggestionSelect', (e) => {
                    e.stopPropagation();
                    const selectedItemData = JSON.parse(listItem.dataset.suggestionData);
                    this.#currentQueryText = selectedItemData[this.#config.displayKey];
                    this.#inputElement.value = this.#currentQueryText;
                    this.#config.onSelectionMade.call(this.#inputElement, selectedItemData, listItem);
                    this.#suggestionList.innerHTML = '';
                    this.#outputPanel.style.display = 'none';
                });

                fragment.appendChild(listItem);
            });
            this.#suggestionList.appendChild(fragment);
        }
    }

    #finalRenderCleanup(totalMatchesCount, originalQuery) {
        this.#inputElement.classList.remove('fetching-status');
        const loadingNote = this.#suggestionList.querySelector('.status-note');
        if (loadingNote && loadingNote.textContent === this.#config.fetchingMessage) {
            loadingNote.remove();
        }

        if (totalMatchesCount === 0 && this.#config.noMatchesMessage) {
            this.#suggestionList.innerHTML = `<li class="status-note">${this.#config.noMatchesMessage}</li>`;
        }
        this.#outputPanel.style.display = 'block';
        this.#config.onRenderComplete.call(this.#inputElement);
    }

    refresh() {
        this.#inputElement.dispatchEvent(new CustomEvent('refreshEnhancer'));
    }

    #updateInputValue(event) {
        const newValue = event.detail;
        this.#currentQueryText = newValue;
        this.#inputElement.value = newValue;
    }

    setValue(newValue) {
        this.#inputElement.dispatchEvent(new CustomEvent('updateValueEnhancer', { detail: newValue }));
    }

    #reconfigure(newSettings) {
        this.#config = { ...this.#config, ...newSettings };
        if (newSettings.additionalParams) {
            this.#config.additionalParams = { ...this.#config.additionalParams, ...newSettings.additionalParams };
        }
    }

    update(newSettings) {
        this.#inputElement.dispatchEvent(new CustomEvent('reconfigureEnhancer', { detail: newSettings }));
    }

    #destroyEnhancer() {
        if (this.#outputPanel && this.#outputPanel.parentNode) {
            this.#outputPanel.remove();
        }
        if (this.#suggestionWrapper && this.#suggestionWrapper.parentNode) {
            this.#suggestionWrapper.parentNode.insertBefore(this.#inputElement, this.#suggestionWrapper);
            this.#suggestionWrapper.remove();
        }

        this.#inputElement.classList.remove('enhancer-input', 'fetching-status');
        this.#inputElement.removeEventListener('focus', this.#boundHandleFocus);
        this.#inputElement.removeEventListener('keydown', this.#boundHandleKeydown);
        this.#inputElement.removeEventListener('blur', this.#boundHandleBlur);
        this.#inputElement.removeEventListener('refreshEnhancer', this.#boundRefreshEnhancer);
        this.#inputElement.removeEventListener('updateValueEnhancer', this.#boundUpdateValueEnhancer);
        this.#inputElement.removeEventListener('reconfigureEnhancer', this.#boundReconfigureEnhancer);
        this.#inputElement.removeEventListener('destroyEnhancer', this.#boundDestroyEnhancer);

        this.#suggestionList.removeEventListener('click', this.#boundHandleResultClick);
        this.#suggestionList.removeEventListener('mouseover', this.#boundHandleResultMouseover);

        if (this.#debounceID) {
            clearTimeout(this.#debounceID);
        }
        this.#cancelPendingRequest();

        this.#inputElement = null;
        this.#suggestionWrapper = null;
        this.#outputPanel = null;
        this.#suggestionList = null;
        this.#currentSearchResults = [];
    }

    destroy() {
        this.#inputElement.dispatchEvent(new CustomEvent('destroyEnhancer'));
    }
}