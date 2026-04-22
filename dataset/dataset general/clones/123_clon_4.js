(function() {

    const processPause = (function() {
        let timerReference = 0;
        return function(actionCallback, delayMilliseconds) {
            clearTimeout(timerReference);
            timerReference = setTimeout(actionCallback, delayMilliseconds);
        };
    })();

    class TwinSelectorComponent {
        constructor(hostElement, userSettings, initialSelections) {
            if (!hostElement || hostElement.tagName !== 'SELECT') {
                console.error("TwinSelectorComponent must be initialized with a <select> element.");
                return;
            }

            this.originalSelectElement = hostElement;
            this.availableItemsData = []; // Internal array of {val, txt, originalTxt, display} objects
            this.chosenItemsData = [];    // Internal array of {val, txt, originalTxt, display} objects

            const standardSettings = {
                sourceURL:          'local.json',
                valueKey:           'id',
                textKey:            'name',
                componentTitle:     'Example',
                fetchDataFromJson:  true,
                debounceDelay:      500,
                horizontalLayout:   false,
                maxTextLength:      45,
                showMoveAllButtons: true,
                bigListThreshold:   500,
                largeMoveWarning:   'Are you sure you want to move this many items? Doing so can cause your browser to become unresponsive.'
            };

            const markupSettings = this.extractDataAttributes(hostElement);
            this.currentSettings = Object.assign({}, standardSettings, markupSettings, userSettings);

            for (const key of ['valueKey', 'textKey', 'componentTitle']) {
                if (this.currentSettings[key] === undefined || this.currentSettings[key] === null) {
                    throw new Error(`TwinSelectorComponent: Setting '${key}' is undefined or null.`);
                }
            }

            this.containerId = `twin-selector-container-${this.currentSettings.componentTitle.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 9)}`;
            this.initialSelections = Array.isArray(initialSelections) ? initialSelections : [];

            if (this.currentSettings.fetchDataFromJson) {
                this.populateFromRemoteSource();
            } else {
                this.extractInitialOptions();
            }
        }

        extractDataAttributes(element) {
            const attributes = {};
            const dataset = element.dataset;
            if (dataset.source) attributes.sourceURL = dataset.source;
            if (dataset.value) attributes.valueKey = dataset.value;
            if (dataset.text) attributes.textKey = dataset.text;
            if (dataset.title) attributes.componentTitle = dataset.title;
            if (dataset.json !== undefined) attributes.fetchDataFromJson = dataset.json === 'true';
            if (dataset.timeout) attributes.debounceDelay = parseInt(dataset.timeout, 10);
            if (dataset.horizontal !== undefined) attributes.horizontalLayout = dataset.horizontal === 'true';
            if (dataset.textLength) attributes.maxTextLength = parseInt(dataset.textLength, 10);
            if (dataset.moveAllBtn !== undefined) attributes.showMoveAllButtons = dataset.moveAllBtn === 'true';
            if (dataset.maxAllBtn) attributes.bigListThreshold = parseInt(dataset.maxAllBtn, 10);
            return attributes;
        }

        async populateFromRemoteSource() {
            try {
                const response = await fetch(this.currentSettings.sourceURL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData = await response.json();
                this.processFetchedData(jsonData);
            } catch (error) {
                console.error("Failed to load JSON data:", error);
            }
        }

        processFetchedData(jsonData) {
            const multipleTextKeys = this.currentSettings.textKey.includes(':');
            const textFields = multipleTextKeys ? this.currentSettings.textKey.split(':') : [this.currentSettings.textKey];

            for (const item of jsonData) {
                let itemText = '';
                if (multipleTextKeys) {
                    itemText = textFields.map(field => item[field]).join(' ');
                } else {
                    itemText = item[this.currentSettings.textKey];
                }

                const optionValue = item[this.currentSettings.valueKey];
                const optionObject = {
                    val: optionValue,
                    txt: itemText,
                    originalTxt: itemText,
                    display: true
                };

                const isInitiallySelected = this.initialSelections.some(
                    (initialItem) => initialItem[this.currentSettings.valueKey] === optionValue
                );

                if (isInitiallySelected) {
                    this.chosenItemsData.push(optionObject);
                } else {
                    this.availableItemsData.push(optionObject);
                }
            }
            this.buildComponent();
        }

        extractInitialOptions() {
            const options = Array.from(this.originalSelectElement.options);
            for (const opt of options) {
                const optionObject = {
                    val: opt.value,
                    txt: opt.textContent,
                    originalTxt: opt.textContent,
                    display: true
                };
                if (opt.selected) {
                    this.chosenItemsData.push(optionObject);
                } else {
                    this.availableItemsData.push(optionObject);
                }
            }
            this.buildComponent();
        }

        buildComponent() {
            const container = document.createElement('div');
            container.id = this.containerId;
            container.classList.add('row');

            const horizontalClass = this.currentSettings.horizontalLayout ? 'col-md-6' : 'col-md-5';
            const horizontalButtonClass = this.currentSettings.showMoveAllButtons ? 'col-md-6' : 'col-md-12';

            container.innerHTML = `
                <div class="${horizontalClass}">
                    <h4><span class="available-title">${this.currentSettings.componentTitle} (Available)</span> <small>- showing <span class="available-count"></span></small></h4>
                    <input class="filter form-control filter-available" type="text" placeholder="Filter" style="margin-bottom: 5px;">
                    ${this.currentSettings.horizontalLayout ? this.makeHorizontalControls(1, this.currentSettings.showMoveAllButtons, horizontalButtonClass) : ''}
                    <select class="available-items form-control" style="height: 200px; width: 100%;" multiple></select>
                </div>
                ${this.currentSettings.horizontalLayout ? '' : this.makeVerticalControls(this.currentSettings.showMoveAllButtons)}
                <div class="${horizontalClass}">
                    <h4><span class="chosen-title">${this.currentSettings.componentTitle} (Chosen)</span> <small>- showing <span class="chosen-count"></span></small></h4>
                    <input class="filter form-control filter-chosen" type="text" placeholder="Filter" style="margin-bottom: 5px;">
                    ${this.currentSettings.horizontalLayout ? this.makeHorizontalControls(2, this.currentSettings.showMoveAllButtons, horizontalButtonClass) : ''}
                    <select class="chosen-items form-control" style="height: 200px; width: 100%;" multiple></select>
                </div>
            `;

            this.originalSelectElement.parentNode.replaceChild(container, this.originalSelectElement);

            this.availableSelectElement = container.querySelector('.available-items');
            this.chosenSelectElement = container.querySelector('.chosen-items');
            this.availableFilterInput = container.querySelector('.filter-available');
            this.chosenFilterInput = container.querySelector('.filter-chosen');
            this.availableCountSpan = container.querySelector('.available-count');
            this.chosenCountSpan = container.querySelector('.chosen-count');

            this.chosenSelectElement.name = this.originalSelectElement.name;

            this.renderOptions();
            this.registerHandlers();
            this.updateCounts();
        }

        makeHorizontalControls(position, displayAllButton, btnClass) {
            if (position === 1) {
                return `
                    ${displayAllButton ? `
                    <button type="button" class="btn btn-default move-all-right" data-action="allRight" style="margin-bottom: 5px;">
                        <span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>` : ''}
                    <button type="button" class="btn btn-default ${displayAllButton ? 'pull-right' : ''} ${btnClass} move-selected-right" data-action="selectedRight" style="margin-bottom: 5px;" disabled>
                        <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>
                `;
            } else {
                return `
                    <button type="button" class="btn btn-default ${btnClass} move-selected-left" data-action="selectedLeft" style="margin-bottom: 5px;" disabled>
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    ${displayAllButton ? `
                    <button type="button" class="btn btn-default ${btnClass} pull-right move-all-left" data-action="allLeft" style="margin-bottom: 5px;">
                        <span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span>
                    </button>` : ''}
                `;
            }
        }

        makeVerticalControls(displayAllButton) {
            const marginTop = displayAllButton ? '80px' : '130px';
            return `
                <div class="col-md-2 text-center" style="margin-top: ${marginTop}">
                    ${displayAllButton ? `
                    <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-all-right" data-action="allRight" style="margin-bottom: 10px;">
                        <span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>` : ''}
                    <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-selected-right" data-action="selectedRight" style="margin-bottom: 20px;" disabled>
                        <span class="glyphicon glyphicon-chevron-right"></span>
                    </button>
                    <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-selected-left" data-action="selectedLeft" style="margin-bottom: 10px;" disabled>
                        <span class="glyphicon glyphicon-chevron-left"></span>
                    </button>
                    ${displayAllButton ? `
                    <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-all-left" data-action="allLeft" style="margin-bottom: 10px;">
                        <span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span>
                    </button>` : ''}
                </div>
            `;
        }

        renderOptions() {
            this.availableSelectElement.innerHTML = '';
            this.chosenSelectElement.innerHTML = '';

            this.alphabetizeOptions(this.availableItemsData);
            this.availableItemsData.forEach(item => {
                if (item.display) {
                    const opt = document.createElement('option');
                    opt.value = item.val;
                    opt.textContent = item.txt.length > this.currentSettings.maxTextLength
                        ? item.txt.substring(0, this.currentSettings.maxTextLength) + '...'
                        : item.txt;
                    if (item.txt.length > this.currentSettings.maxTextLength) {
                         opt.title = item.originalTxt;
                    }
                    this.availableSelectElement.appendChild(opt);
                }
            });

            this.alphabetizeOptions(this.chosenItemsData);
            this.chosenItemsData.forEach(item => {
                if (item.display) {
                    const opt = document.createElement('option');
                    opt.value = item.val;
                    opt.textContent = item.txt.length > this.currentSettings.maxTextLength
                        ? item.txt.substring(0, this.currentSettings.maxTextLength) + '...'
                        : item.txt;
                    if (item.txt.length > this.currentSettings.maxTextLength) {
                         opt.title = item.originalTxt;
                    }
                    this.chosenSelectElement.appendChild(opt);
                }
            });

            this.updateCounts();
        }

        registerHandlers() {
            const container = document.getElementById(this.containerId);

            container.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    const button = e.target.closest('button');
                    const action = button.dataset.action;
                    if (action) {
                        this.handleButtonClick(action);
                    }
                }
            });

            this.availableFilterInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') e.preventDefault();
                processPause(() => this.applySearchFilter(this.availableFilterInput.value, this.availableItemsData), this.currentSettings.debounceDelay);
            });
            this.chosenFilterInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') e.preventDefault();
                processPause(() => this.applySearchFilter(this.chosenFilterInput.value, this.chosenItemsData), this.currentSettings.debounceDelay);
            });

            this.availableSelectElement.addEventListener('change', () => this.adjustControlStates());
            this.chosenSelectElement.addEventListener('change', () => this.adjustControlStates());

            const parentForm = container.closest('form');
            if (parentForm) {
                parentForm.addEventListener('submit', () => {
                    Array.from(this.chosenSelectElement.options).forEach(option => option.selected = true);
                });
            }
        }

        handleButtonClick(action) {
            let itemsToProcess = [];
            let confirmRequired = false;

            switch (action) {
                case 'selectedRight':
                    itemsToProcess = Array.from(this.availableSelectElement.selectedOptions).map(opt => this.availableItemsData.find(item => item.val == opt.value));
                    this.moveItems(itemsToProcess, this.availableItemsData, this.chosenItemsData);
                    break;
                case 'allRight':
                    itemsToProcess = this.availableItemsData.filter(item => item.display);
                    if (itemsToProcess.length >= this.currentSettings.bigListThreshold) {
                        confirmRequired = confirm(this.currentSettings.largeMoveWarning);
                    }
                    if (itemsToProcess.length < this.currentSettings.bigListThreshold || confirmRequired) {
                        this.moveItems(itemsToProcess, this.availableItemsData, this.chosenItemsData);
                    }
                    break;
                case 'selectedLeft':
                    itemsToProcess = Array.from(this.chosenSelectElement.selectedOptions).map(opt => this.chosenItemsData.find(item => item.val == opt.value));
                    this.moveItems(itemsToProcess, this.chosenItemsData, this.availableItemsData);
                    break;
                case 'allLeft':
                    itemsToProcess = this.chosenItemsData.filter(item => item.display);
                     if (itemsToProcess.length >= this.currentSettings.bigListThreshold) {
                        confirmRequired = confirm(this.currentSettings.largeMoveWarning);
                    }
                    if (itemsToProcess.length < this.currentSettings.bigListThreshold || confirmRequired) {
                        this.moveItems(itemsToProcess, this.chosenItemsData, this.availableItemsData);
                    }
                    break;
            }

            this.availableFilterInput.value = '';
            this.chosenFilterInput.value = '';
            this.availableItemsData.forEach(item => item.display = true);
            this.chosenItemsData.forEach(item => item.display = true);

            this.renderOptions();
        }

        moveItems(itemsToMove, sourceArray, destinationArray) {
            for (const item of itemsToMove) {
                const index = sourceArray.findIndex(dataItem => dataItem.val === item.val);
                if (index !== -1) {
                    const [movedItem] = sourceArray.splice(index, 1);
                    destinationArray.push(movedItem);
                }
            }
        }

        applySearchFilter(query, targetArray) {
            const regex = new RegExp(query, 'gi');
            targetArray.forEach(item => {
                item.display = regex.test(item.originalTxt);
            });
            this.renderOptions();
        }

        alphabetizeOptions(optionsArray) {
            optionsArray.sort((a, b) => {
                const textA = a.txt.toLowerCase();
                const textB = b.txt.toLowerCase();
                if (textA < textB) return -1;
                if (textA > textB) return 1;
                return 0;
            });
        }

        updateCounts() {
            const visibleAvailableCount = this.availableItemsData.filter(item => item.display).length;
            const visibleChosenCount = this.chosenItemsData.filter(item => item.display).length;

            this.availableCountSpan.textContent = visibleAvailableCount;
            this.chosenCountSpan.textContent = visibleChosenCount;

            this.adjustControlStates();
        }

        adjustControlStates() {
            const container = document.getElementById(this.containerId);
            const selectedAvailable = this.availableSelectElement.selectedOptions.length > 0;
            const selectedChosen = this.chosenSelectElement.selectedOptions.length > 0;
            const hasVisibleAvailable = this.availableItemsData.filter(item => item.display).length > 0;
            const hasVisibleChosen = this.chosenItemsData.filter(item => item.display).length > 0;

            container.querySelector('.move-selected-right').disabled = !selectedAvailable;
            container.querySelector('.move-selected-left').disabled = !selectedChosen;

            const moveAllRightButton = container.querySelector('.move-all-right');
            if (moveAllRightButton) moveAllRightButton.disabled = !hasVisibleAvailable;

            const moveAllLeftButton = container.querySelector('.move-all-left');
            if (moveAllLeftButton) moveAllLeftButton.disabled = !hasVisibleChosen;
        }
    }

    window.initializeTwinSelector = function(selector, options, initialSelections) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            new TwinSelectorComponent(element, options, initialSelections);
        });
    };

})();