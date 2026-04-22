(function() {
    const defaultPaginationSettings = {
        totalCountIdentifier: 'totalCount',
        beginPage: 1,
        pageIdentifier: 'page',
        limitIdentifier: 'limit',
        limitLabelText: 'Show {0} entries',
        totalCountLabelText: 'Total: <span>{0}</span> records',
        entryLimit: undefined,
        limitOptions: [20, 30, 40, 50]
    };

    class PageNavigator {
        constructor(domElement, configOptions) {
            this.hostElement = domElement;
            this.settings = configOptions;

            this.gridControl = null;
            this.recordCountDisplay = null;
            this.pageLinkContainer = null;
            this.entryCountSelector = null;

            this.currentPage = this.settings.beginPage;
            this.totalRecords = 0;
            this.entriesPerPage = this.settings.entryLimit || this.settings.limitOptions[0];

            this._buildVisuals();
        }

        _buildVisuals() {
            this.hostElement.classList.add("paginationWidget");

            const structureHTML = `
                <div class="recordCountDisplay"></div>
                <ul class="pageLinkContainer"></ul>
                <div class="entryCountControl"><select></select></div>
            `;
            this.hostElement.insertAdjacentHTML('beforeend', structureHTML);

            this.recordCountDisplay = this.hostElement.querySelector('.recordCountDisplay');
            this.pageLinkContainer = this.hostElement.querySelector('.pageLinkContainer');
            this.entryCountSelector = this.hostElement.querySelector('.entryCountControl select');

            this.settings.limitOptions.forEach(optionValue => {
                const optionElement = document.createElement('option');
                optionElement.value = optionValue;
                optionElement.textContent = this.composeText(this.settings.limitLabelText, [optionValue]);
                this.entryCountSelector.appendChild(optionElement);
            });

            if (this.settings.entryLimit) {
                this.entryCountSelector.value = this.settings.entryLimit;
            } else {
                this.entryCountSelector.value = this.settings.limitOptions[0];
            }

            this.entryCountSelector.addEventListener('change', () => {
                this.currentPage = 1;
                this.entriesPerPage = parseInt(this.entryCountSelector.value, 10);
                this.gridControl && this.gridControl.reloadContent();
            });
        }

        _displayPageIndicators(current, totalRecordsVal, perPage) {
            this.pageLinkContainer.innerHTML = '';

            let totalPages = totalRecordsVal === 0 ? 0 : Math.ceil(totalRecordsVal / perPage);
            totalPages = totalPages || 0;

            if (totalPages === 0) {
                current = 1;
            } else if (current > totalPages) {
                current = totalPages;
            } else if (current < 1) {
                current = 1;
            }

            const previousLink = this._createNavElement('«', 'previousPageLink', () => {
                this.currentPage = current - 1;
                this.gridControl && this.gridControl.reloadContent();
            });
            if (current <= 1) {
                previousLink.classList.add('inactive');
                previousLink.querySelector('a').removeAttribute('tabindex');
            }
            this.pageLinkContainer.appendChild(previousLink);

            const pageSequence = this._constructPageSequence(current, totalPages);

            pageSequence.forEach(item => {
                const listItem = document.createElement('li');
                const anchor = document.createElement('a');

                if (item === '...') {
                    listItem.textContent = '...';
                } else if (item === current) {
                    listItem.classList.add('current');
                    anchor.textContent = item;
                    listItem.appendChild(anchor);
                } else {
                    anchor.textContent = item;
                    anchor.title = `Navigate to page ${item}`;
                    anchor.addEventListener('click', () => {
                        this.currentPage = item;
                        this.gridControl && this.gridControl.reloadContent();
                    });
                    listItem.appendChild(anchor);
                }
                this.pageLinkContainer.appendChild(listItem);
            });

            const nextLink = this._createNavElement('»', 'nextPageLink', () => {
                this.currentPage = current + 1;
                this.gridControl && this.gridControl.reloadContent();
            }, 'Go to next page');
            if (current >= totalPages) {
                nextLink.classList.add('inactive');
                nextLink.querySelector('a').removeAttribute('tabindex');
            }
            this.pageLinkContainer.appendChild(nextLink);
        }

        _createNavElement(displayText, className, clickHandler, hoverTitle = '') {
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.textContent = displayText;
            if (hoverTitle) {
                anchor.title = hoverTitle;
            }
            listItem.classList.add(className);
            listItem.appendChild(anchor);
            if (clickHandler) {
                anchor.addEventListener('click', clickHandler);
            }
            return listItem;
        }

        _constructPageSequence(current, total) {
            if (total <= 0) return [];
            if (total === 1) return [1];

            const sequence = new Set();
            const visibleRadius = 2;

            sequence.add(1);
            sequence.add(total);

            for (let i = -visibleRadius; i <= visibleRadius; i++) {
                const pageNum = current + i;
                if (pageNum > 1 && pageNum < total) {
                    sequence.add(pageNum);
                }
            }

            const sortedNumbers = Array.from(sequence).filter(n => typeof n === 'number').sort((a, b) => a - b);
            const finalDisplay = [];
            let lastAdded = null;

            for (const num of sortedNumbers) {
                if (lastAdded !== null && num > lastAdded + 1) {
                    finalDisplay.push('...');
                }
                finalDisplay.push(num);
                lastAdded = num;
            }

            return finalDisplay;
        }

        refreshState(inputParameters) {
            inputParameters = inputParameters || {};

            let newPage = inputParameters[this.settings.pageIdentifier];
            if (newPage !== undefined && newPage !== null) {
                this.currentPage = newPage;
            }

            let newTotalRecords = inputParameters[this.settings.totalCountIdentifier];
            if (newTotalRecords !== undefined) {
                this.totalRecords = newTotalRecords;
            }

            let newLimit = inputParameters[this.settings.limitIdentifier];
            if (newLimit) {
                this.entriesPerPage = parseInt(newLimit, 10);
                this.entryCountSelector.value = newLimit;
            } else {
                this.entriesPerPage = parseInt(this.entryCountSelector.value, 10);
            }

            this.recordCountDisplay.innerHTML = this.composeText(this.settings.totalCountLabelText, [this.totalRecords]);
            this._displayPageIndicators(this.currentPage, this.totalRecords, this.entriesPerPage);
        }

        composeText(template, variables) {
            return template.replace(/{(\d+)}/g, (match, number) => {
                return typeof variables[number] !== 'undefined' ? variables[number] : match;
            });
        }

        getCriteria() {
            const criteria = {};
            criteria[this.settings.pageIdentifier] = this.currentPage;
            criteria[this.settings.limitIdentifier] = this.entriesPerPage;
            return criteria;
        }

        activate(gridInstance) {
            this.gridControl = gridInstance;

            if (this.gridControl && typeof this.gridControl.registerLoadHandler === 'function') {
                this.gridControl.registerLoadHandler(data => {
                    this.refreshState(data);
                });
            } else if (this.gridControl && typeof this.gridControl.onLoadComplete === 'function') {
                 this.gridControl.onLoadComplete(data => {
                    this.refreshState(data);
                });
            } else {
                 console.warn("Grid control does not have expected 'registerLoadHandler' or 'onLoadComplete' method for pagination integration.");
            }

            const initialParams = {};
            initialParams[this.settings.totalCountIdentifier] = 0;
            initialParams[this.settings.pageIdentifier] = this.settings.beginPage;
            initialParams[this.settings.limitIdentifier] = this.settings.entryLimit || this.settings.limitOptions[0];
            this.refreshState(initialParams);

            if (gridInstance && gridInstance.configuration && gridInstance.configuration.hasIndexColumn) {
                const indexColumn = gridInstance.configuration.columns[0];
                indexColumn.renderFunction = (value, item, rowIndex) => {
                    const currentCriteria = this.getCriteria();
                    return `<span class="grid-index">${(rowIndex + 1 + ((currentCriteria[this.settings.pageIdentifier] - 1) * currentCriteria[this.settings.limitIdentifier]))}</span>`;
                };
            }
        }
    }

    window.createPageNavigator = function(element, options) {
        const combinedOptions = { ...defaultPaginationSettings, ...options };
        return new PageNavigator(element, combinedOptions);
    };

})();