(function() {
    class ItemSeeker {
        static defaultConfiguration = {
            dataPath: '/search.json',
            keySchema: 'title,category,desc,url,date,shortdate',
            displayFormat: '<a href="{url}" title="{title}">{title}</a>',
            outputSelector: '.results',
            headingContent: '<h4>Search results</h4>',
            resultCap: 10,
            noFindingsMessage: '<p>Oh shucks<br/><small>Nothing found :(</small></p>'
        };

        constructor(triggerElementNode, customConfiguration = {}) {
            this.inputNode = triggerElementNode;
            this.config = { ...ItemSeeker.defaultConfiguration, ...customConfiguration };

            this.retrievedData = [];
            this.searchableKeys = this.config.keySchema.split(',');
            this.resultsContainer = document.querySelector(this.config.outputSelector);

            if (!this.inputNode || !this.resultsContainer) {
                console.error("ItemSeeker: Input or results container not found.");
                return;
            }

            this.initializeSearch();
        }

        async initializeSearch() {
            if (this.config.dataPath && this.resultsContainer) {
                try {
                    const response = await fetch(this.config.dataPath);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    this.retrievedData = await response.json();
                    this.attachInputMonitor();
                } catch (error) {
                    console.error("ItemSeeker: Failed to obtain records.", error);
                }
            }
        }

        attachInputMonitor() {
            this.inputNode.addEventListener('input', this.handleInputEvent.bind(this));
        }

        handleInputEvent() {
            const currentQuery = this.inputNode.value;
            if (currentQuery.length > 0) {
                const foundItems = this.uncoverMatches(currentQuery);
                this.renderOutcomes(foundItems);
            } else {
                this.obliterateOutcomes();
            }
        }

        uncoverMatches(queryText) {
            const normalizedQuery = queryText.toLowerCase();
            return this.retrievedData.filter(record =>
                this.searchableKeys.some(key => {
                    const value = record[key];
                    return value !== undefined && String(value).toLowerCase().indexOf(normalizedQuery) > 1;
                })
            );
        }

        substitutePlaceholders(templateString, dataObject) {
            return templateString.replace(/\{(\w+)\}/g, (match, key) => {
                const value = dataObject[key];
                return value !== undefined ? String(value) : match;
            });
        }

        renderOutcomes(matchedItems) {
            this.obliterateOutcomes();

            this.resultsContainer.insertAdjacentHTML('beforeend', this.config.headingContent);

            if (matchedItems.length > 0) {
                const itemsToDisplay = matchedItems.slice(0, this.config.resultCap);
                const resultsMarkup = itemsToDisplay.map(item =>
                    this.substitutePlaceholders(this.config.displayFormat, item)
                ).join('');
                this.resultsContainer.insertAdjacentHTML('beforeend', resultsMarkup);
            } else {
                this.resultsContainer.insertAdjacentHTML('beforeend', this.config.noFindingsMessage);
            }
        }

        obliterateOutcomes() {
            while (this.resultsContainer.firstChild) {
                this.resultsContainer.removeChild(this.resultsContainer.firstChild);
            }
        }
    }

    window.initiateContentSearch = function(inputElementSelector, options) {
        const inputElement = document.querySelector(inputElementSelector);
        if (!inputElement) {
            console.warn(`initiateContentSearch: Target input element not found for selector "${inputElementSelector}".`);
            return null;
        }
        return new ItemSeeker(inputElement, options);
    };

})();