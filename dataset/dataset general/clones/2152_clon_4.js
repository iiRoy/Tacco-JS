(function () {
    "use strict";

    // Renamed from ko.bindingHandlers.multiselect
    if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.complexSelector) {
        // Store instances of our custom selector
        const instanceRegistry = new WeakMap();

        ko.bindingHandlers.complexSelector = {
            after: ['options', 'value', 'selectedOptions'],

            init: function(domElement, accessorValue, allBoundProperties, modelView, bindingContextWrapper) {
                const componentConfig = ko.toJS(accessorValue());

                // Initialize our custom selector
                const selectorInstance = new ComplexChoiceMechanism(domElement, componentConfig);
                instanceRegistry.set(domElement, selectorInstance);

                if (allBoundProperties.has('options')) {
                    const availableOptions = allBoundProperties.get('options');
                    if (ko.isObservable(availableOptions)) {
                        ko.computed({
                            read: function() {
                                availableOptions(); // Trigger subscription
                                Promise.resolve().then(() => { // Using Promise for next tick instead of setTimeout(..., 1)
                                    const currentInstance = instanceRegistry.get(domElement);
                                    if (currentInstance) {
                                        currentInstance.updateSourceChoices(); // Renamed from updateOriginalOptions
                                        currentInstance.reconstructView(); // Renamed from rebuild
                                    }
                                });
                            },
                            disposeWhenNodeIsRemoved: domElement
                        });
                    }
                }

                if (allBoundProperties.has('value')) {
                    const selectedValue = allBoundProperties.get('value');
                    if (ko.isObservable(selectedValue)) {
                        ko.computed({
                            read: function() {
                                selectedValue(); // Trigger subscription
                                Promise.resolve().then(() => {
                                    const currentInstance = instanceRegistry.get(domElement);
                                    if (currentInstance) {
                                        currentInstance.refreshDisplay(); // Renamed from refresh
                                    }
                                });
                            },
                            disposeWhenNodeIsRemoved: domElement
                        }).extend({ rateLimit: 100, notifyWhenChangesStop: true });
                    }
                }

                if (allBoundProperties.has('selectedOptions')) {
                    const activeOptions = allBoundProperties.get('selectedOptions');
                    if (ko.isObservable(activeOptions)) {
                        ko.computed({
                            read: function() {
                                activeOptions(); // Trigger subscription
                                Promise.resolve().then(() => {
                                    const currentInstance = instanceRegistry.get(domElement);
                                    if (currentInstance) {
                                        currentInstance.refreshDisplay(); // Renamed from refresh
                                    }
                                });
                            },
                            disposeWhenNodeIsRemoved: domElement
                        }).extend({ rateLimit: 100, notifyWhenChangesStop: true });
                    }
                }

                ko.utils.domNodeDisposal.addDisposeCallback(domElement, function() {
                    const currentInstance = instanceRegistry.get(domElement);
                    if (currentInstance) {
                        currentInstance.dismantleComponent(); // Renamed from destroy
                        instanceRegistry.delete(domElement);
                    }
                });
            },

            update: function(domElement, accessorValue, allBoundProperties, modelView, bindingContextWrapper) {
                const componentConfig = ko.toJS(accessorValue());

                const currentInstance = instanceRegistry.get(domElement);
                if (currentInstance) {
                    currentInstance.setConfiguration(componentConfig); // Renamed from setOptions
                    currentInstance.reconstructView(); // Renamed from rebuild
                }
            }
        };
    }

    /**
     * Represents a custom complex choice selection mechanism.
     * Replaces the Multiselect class.
     */
    class ComplexChoiceMechanism {
        static standardSettings = { // Renamed from defaults
            labelFormatter: function(chosenItems, sourceElement) { // Renamed from buttonText
                if (chosenItems.length === 0) {
                    return this.noSelectionMessage;
                } else if (this.allChosenMessage && chosenItems.length === sourceElement.querySelectorAll('option').length) {
                    return this.selectAllCount ? `${this.allChosenMessage} (${chosenItems.length})` : this.allChosenMessage;
                } else if (chosenItems.length > this.displayLimit) { // Renamed from numberDisplayed
                    return `${chosenItems.length} ${this.itemsSelectedMessage}`; // Renamed from nSelectedText
                } else {
                    return Array.from(chosenItems).map(item => item.getAttribute('label') || item.textContent).join(', ');
                }
            },
            tooltipFormatter: function(chosenItems, sourceElement) { // Renamed from buttonTitle
                if (chosenItems.length === 0) {
                    return this.noSelectionMessage;
                } else {
                    return Array.from(chosenItems).map(item => item.textContent).join(', ');
                }
            },
            choiceLabelExtractor: (itemElement) => itemElement.getAttribute('label') || itemElement.textContent, // Renamed from optionLabel
            onSelectionChange: (item, isChecked) => {}, // Renamed from onChange
            onPanelReveal: (event) => {}, // Renamed from onDropdownShow
            onPanelConceal: (event) => {}, // Renamed from onDropdownHide
            afterPanelRevealed: (event) => {}, // Renamed from onDropdownShown
            afterPanelConcealed: (event) => {}, // Renamed from onDropdownHidden
            onGlobalSelect: () => {}, // Renamed from onSelectAll
            controlButtonClass: 'btn btn-default', // Renamed from buttonClass
            inheritBaseClass: false, // Renamed from inheritClass
            controlButtonWidth: 'auto', // Renamed from buttonWidth
            controlButtonContainer: '<div class="btn-group" />', // Renamed from buttonContainer
            alignRight: false, // Renamed from dropRight
            activeItemClass: 'active', // Renamed from selectedClass
            maxDropdownHeight: false, // Renamed from maxHeight
            checkboxFieldname: false, // Renamed from checkboxName
            includeGlobalToggleOption: false, // Renamed from includeSelectAllOption
            globalToggleThreshold: 0, // Renamed from includeSelectAllIfMoreThan
            globalToggleText: ' Select all', // Renamed from selectAllText
            globalToggleValue: 'complex-selector-all', // Renamed from selectAllValue
            globalToggleName: false, // Renamed from selectAllName
            selectAllCount: true, // Renamed from selectAllNumber
            enableSearchFeature: false, // Renamed from enableFiltering
            caseInsensitiveSearch: false, // Renamed from enableCaseInsensitiveFiltering
            clickableGroupHeaders: false, // Renamed from enableClickableOptGroups
            searchPrompt: 'Search', // Renamed from filterPlaceholder
            searchMethod: 'text', // Renamed from filterBehavior ('text', 'value', 'both')
            includeSearchClearButton: true, // Renamed from includeFilterClearBtn
            preventInputInteractionEvent: false, // Renamed from preventInputChangeEvent
            noSelectionMessage: 'None selected', // Renamed from nonSelectedText
            itemsSelectedMessage: 'selected', // Renamed from nSelectedText
            allChosenMessage: 'All selected', // Renamed from allSelectedText
            displayLimit: 3, // Renamed from numberDisplayed
            deactivateIfEmpty: false, // Renamed from disableIfEmpty
            uiTemplates: { // Renamed from templates
                control: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',
                list: '<ul class="multiselect-container dropdown-menu"></ul>',
                search: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                searchClear: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                listItem: '<li><a tabindex="0"><label></label></a></li>',
                separator: '<li class="multiselect-item divider"></li>',
                listGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
            }
        };

        constructor(baseSelectElement, customConfiguration) {
            this.originalElement = baseSelectElement; // Renamed from $select
            this.configuration = this.mergeSettings(Object.assign({}, customConfiguration, this.extractDataAttributes(baseSelectElement))); // Renamed from options, $select.data()

            this.initialOptionsSnapshot = Array.from(baseSelectElement.options).map(opt => opt.cloneNode(true)); // Renamed from originalOptions and $select.clone()[0].options
            this.currentSearchQuery = ''; // Renamed from query
            this.searchDelayTimer = null; // Renamed from searchTimeout
            this.lastActivatedInput = null; // Renamed from lastToggledInput

            this.configuration.isMultiple = baseSelectElement.hasAttribute('multiple'); // Renamed from options.multiple
            
            // Bind callbacks to the instance
            ['labelFormatter', 'tooltipFormatter', 'onSelectionChange', 'onPanelReveal', 'onPanelConceal', 'afterPanelRevealed', 'afterPanelConcealed', 'onGlobalSelect'].forEach(prop => {
                if (typeof this.configuration[prop] === 'function') {
                    this.configuration[prop] = this.configuration[prop].bind(this.configuration); // Bind to configuration for context as in original
                }
            });

            this.constructMainWrapper();
            this.formControlButton();
            this.establishDropdownMenu();
            this.addGlobalSelectionToggle();
            this.populateDropdownChoices();
            this.implementSearchFilter();

            this.refreshButtonLabel();
            this.synchronizeGlobalToggle();

            if (this.configuration.deactivateIfEmpty && baseSelectElement.options.length <= 0) {
                this.deactivateComponent();
            }

            this.originalElement.style.display = 'none'; // Replaces $select.hide()
            this.originalElement.parentNode.insertBefore(this.displayWrapper, this.originalElement.nextSibling); // Replaces .after()

            this.dropdownPanelClickListener = this.handleInputSelection.bind(this);
            this.dropdownPanel.addEventListener('change', this.dropdownPanelClickListener);

            this.documentClickListener = this.handleDocumentClick.bind(this);
            document.addEventListener('click', this.documentClickListener);
        }

        extractDataAttributes(element) {
            const attributes = {};
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.substring(5).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    attributes[key] = attr.value;
                }
            });
            return attributes;
        }

        mergeSettings(customSettings) {
            const merged = Object.assign({}, ComplexChoiceMechanism.standardSettings, customSettings);
            merged.uiTemplates = Object.assign({}, ComplexChoiceMechanism.standardSettings.uiTemplates, customSettings.uiTemplates);
            return merged;
        }

        setConfiguration(newConfig) { // Replaces setOptions
            this.configuration = this.mergeSettings(newConfig);
        }

        updateSourceChoices() { // Replaces updateOriginalOptions
            this.initialOptionsSnapshot = Array.from(this.originalElement.options).map(opt => opt.cloneNode(true));
        }

        reconstructView() { // Replaces rebuild
            this.dropdownPanel.removeEventListener('change', this.dropdownPanelClickListener);
            this.dropdownPanel.innerHTML = ''; // Clear existing options
            this.addGlobalSelectionToggle();
            this.implementSearchFilter(); // Re-add filter if enabled
            this.populateDropdownChoices(); // This will re-add event listeners
            this.refreshButtonLabel();
            this.synchronizeGlobalToggle();
            this.dropdownPanel.addEventListener('change', this.dropdownPanelClickListener);
        }

        refreshDisplay() { // Replaces refresh
            this.populateDropdownChoices(true); // Re-render choices, preserving current selection visually
            this.refreshButtonLabel();
            this.synchronizeGlobalToggle();
        }

        dismantleComponent() { // Replaces destroy
            if (this.displayWrapper && this.displayWrapper.parentNode) {
                this.displayWrapper.parentNode.removeChild(this.displayWrapper);
            }
            this.originalElement.style.display = ''; // Show original select
            this.dropdownPanel.removeEventListener('change', this.dropdownPanelClickListener);
            document.removeEventListener('click', this.documentClickListener);
        }

        constructMainWrapper() { // Renamed from buildContainer
            const containerDiv = document.createElement('div');
            containerDiv.className = (this.configuration.controlButtonContainer.match(/class="([^"]*)"/)?.[1] || '') + ' dropdown'; // Add dropdown class for Bootstrap styling
            this.displayWrapper = containerDiv;

            this.displayWrapper.addEventListener('click', (event) => {
                if (this.controlButton && this.controlButton.contains(event.target)) {
                    this.toggleDropdownPanel();
                }
            });
        }

        handleDocumentClick(event) {
            if (!this.displayWrapper.contains(event.target)) {
                this.hideDropdownPanel();
            }
        }

        toggleDropdownPanel() {
            if (this.dropdownPanel.classList.contains('open')) {
                this.hideDropdownPanel();
            } else {
                this.showDropdownPanel();
            }
        }

        showDropdownPanel() {
            if (!this.dropdownPanel.classList.contains('open')) {
                this.dropdownPanel.classList.add('open');
                this.displayWrapper.classList.add('open');
                this.configuration.onPanelReveal();
                Promise.resolve().then(() => this.configuration.afterPanelRevealed());
            }
        }

        hideDropdownPanel() {
            if (this.dropdownPanel.classList.contains('open')) {
                this.dropdownPanel.classList.remove('open');
                this.displayWrapper.classList.remove('open');
                this.configuration.onPanelConceal();
                Promise.resolve().then(() => this.configuration.afterPanelConcealed());
            }
        }

        formControlButton() { // Renamed from buildButton
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.configuration.uiTemplates.control;
            this.controlButton = tempDiv.firstElementChild;
            this.controlButton.classList.add(...this.configuration.controlButtonClass.split(' '));

            if (this.originalElement.className && this.configuration.inheritBaseClass) {
                this.controlButton.classList.add(...this.originalElement.className.split(' '));
            }

            if (this.originalElement.disabled) {
                this.deactivateComponent();
            } else {
                this.activateComponent();
            }

            if (this.configuration.controlButtonWidth !== 'auto') {
                Object.assign(this.controlButton.style, {
                    width: this.configuration.controlButtonWidth,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                });
                Object.assign(this.displayWrapper.style, {
                    width: this.configuration.controlButtonWidth
                });
            }

            const tabIndex = this.originalElement.tabIndex;
            if (tabIndex !== -1) {
                this.controlButton.tabIndex = tabIndex;
            }

            this.displayWrapper.prepend(this.controlButton);
        }

        establishDropdownMenu() { // Renamed from buildDropdown
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.configuration.uiTemplates.list;
            this.dropdownPanel = tempDiv.firstElementChild;

            if (this.configuration.alignRight) {
                this.dropdownPanel.classList.add('pull-right');
            }

            if (this.configuration.maxDropdownHeight) {
                Object.assign(this.dropdownPanel.style, {
                    maxHeight: `${this.configuration.maxDropdownHeight}px`,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                });
            }

            this.displayWrapper.append(this.dropdownPanel);
        }

        populateDropdownChoices(preserveVisualSelection = false) { // Renamed from buildDropdownOptions
            this.listItemMap = new Map();

            // Clear all items except filter and global toggle if they exist and we're preserving
            if (preserveVisualSelection) {
                Array.from(this.dropdownPanel.children).forEach(child => {
                    if (!child.classList.contains('filter') && !child.classList.contains('multiselect-all')) {
                        child.remove();
                    }
                });
            } else {
                this.dropdownPanel.innerHTML = ''; // Clear everything for a full rebuild
                this.addGlobalSelectionToggle(); // Re-add global toggle after clear
                this.implementSearchFilter(); // Re-add filter after clear
            }


            const processOption = (optElement, parentGroupLi = null) => {
                if (optElement.value === this.configuration.globalToggleValue) {
                    return;
                }
                if (optElement.dataset.role === 'divider') {
                    this.createChoiceSeparator(parentGroupLi);
                } else {
                    this.createChoiceItem(optElement, parentGroupLi);
                }
            };

            const processOptgroup = (optgroupElement) => {
                const groupItem = this.createChoiceGroup(optgroupElement);
                Array.from(optgroupElement.children).forEach(childOpt => processOption(childOpt, groupItem));
            };

            Array.from(this.originalElement.children).forEach(child => {
                const tagName = child.tagName.toLowerCase();
                if (tagName === 'optgroup') {
                    processOptgroup(child);
                } else if (tagName === 'option') {
                    processOption(child);
                }
            });

            // Update visual state based on original element's selection
            this.originalElement.querySelectorAll('option').forEach(originalOpt => {
                const li = this.listItemMap.get(originalOpt.value);
                if (li) {
                    const input = li.querySelector('input');
                    if (input) {
                        input.checked = originalOpt.selected;
                        if (originalOpt.selected) {
                            li.classList.add(this.configuration.activeItemClass);
                        } else {
                            li.classList.remove(this.configuration.activeItemClass);
                        }
                    }
                }
            });
        }

        createChoiceSeparator(parent = this.dropdownPanel) { // Renamed from createDivider
            const separatorElement = document.createElement('li');
            separatorElement.className = this.configuration.uiTemplates.separator.match(/class="([^"]*)"/)?.[1] || '';
            parent.appendChild(separatorElement);
        }

        createChoiceGroup(optgroupElement) { // Renamed from createOptgroup
            const groupLi = document.createElement('li');
            groupLi.className = this.configuration.uiTemplates.listGroup.match(/class="([^"]*)"/)?.[1] || '';
            const labelElement = document.createElement('label');
            labelElement.textContent = optgroupElement.label;
            groupLi.appendChild(labelElement);
            this.dropdownPanel.appendChild(groupLi);

            if (this.configuration.clickableGroupHeaders) {
                groupLi.addEventListener('click', (event) => {
                    // Prevent click from propagating to parent LI if there's a nested structure
                    event.stopPropagation();
                    const groupOptions = Array.from(optgroupElement.children);
                    const allSelectedInGroup = groupOptions.every(opt => opt.selected || opt.disabled); // Consider disabled options as "selected" for checking all

                    groupOptions.forEach(opt => {
                        if (!opt.disabled) {
                            this.updateOptionSelection(opt.value, !allSelectedInGroup);
                        }
                    });
                    this.refreshButtonLabel();
                    this.synchronizeGlobalToggle();
                });
            }
            return groupLi;
        }

        createChoiceItem(optionElement, parentGroupLi = null) { // Renamed from createOptionValue
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.configuration.uiTemplates.listItem;
            const listItem = tempDiv.firstElementChild;
            const anchor = listItem.firstElementChild;
            const label = anchor.firstElementChild;

            const inputType = this.configuration.isMultiple ? 'checkbox' : 'radio';
            const inputElement = document.createElement('input');
            inputElement.type = inputType;
            inputElement.value = optionElement.value;
            inputElement.name = this.configuration.checkboxFieldname || (this.configuration.isMultiple ? '' : this.originalElement.name || '');

            label.prepend(inputElement);
            label.appendChild(document.createTextNode(' ' + this.configuration.choiceLabelExtractor(optionElement)));

            if (optionElement.selected) {
                listItem.classList.add(this.configuration.activeItemClass);
                inputElement.checked = true;
            }

            if (optionElement.disabled) {
                inputElement.disabled = true;
                listItem.classList.add('disabled');
            }

            if (parentGroupLi) {
                let groupUl = parentGroupLi.querySelector('ul');
                if (!groupUl) {
                    groupUl = document.createElement('ul');
                    parentGroupLi.appendChild(groupUl);
                }
                groupUl.appendChild(listItem);
            } else {
                this.dropdownPanel.appendChild(listItem);
            }

            this.listItemMap.set(optionElement.value, listItem);
        }

        handleInputSelection(event) { // Replaces the anonymous change handler in buildDropdownOptions
            const targetInput = event.target;
            // Only process if the target is an actual input within a list item
            if (targetInput.tagName !== 'INPUT' || !targetInput.closest('li')) return;

            const isChecked = targetInput.checked;
            const itemValue = targetInput.value;
            const isGlobalToggle = itemValue === this.configuration.globalToggleValue;
            const parentListItem = targetInput.closest('li');

            if (this.configuration.activeItemClass) {
                if (isChecked) {
                    parentListItem.classList.add(this.configuration.activeItemClass);
                } else {
                    parentListItem.classList.remove(this.configuration.activeItemClass);
                }
            }

            if (isGlobalToggle) {
                if (isChecked) {
                    this.markAllChoices();
                } else {
                    this.clearAllChoices();
                }
            } else {
                this.updateOptionSelection(itemValue, isChecked);

                if (!this.configuration.isMultiple && isChecked) {
                    this.hideDropdownPanel();
                }
            }

            this.refreshButtonLabel();
            this.synchronizeGlobalToggle();
            this.configuration.onSelectionChange(this.retrieveOptionByValue(itemValue), isChecked);
        }

        updateOptionSelection(value, selectState) {
            const originalOption = this.retrieveOptionByValue(value);
            if (!originalOption) return;

            originalOption.selected = selectState;

            if (!this.configuration.isMultiple && selectState) {
                Array.from(this.originalElement.options).forEach(opt => {
                    if (opt !== originalOption && opt.selected) {
                        opt.selected = false;
                        const otherLi = this.listItemMap.get(opt.value);
                        if (otherLi) {
                            otherLi.classList.remove(this.configuration.activeItemClass);
                            const otherInput = otherLi.querySelector('input');
                            if (otherInput) otherInput.checked = false;
                        }
                    }
                });
            }

            const currentLi = this.listItemMap.get(value);
            if (currentLi) {
                if (selectState) {
                    currentLi.classList.add(this.configuration.activeItemClass);
                } else {
                    currentLi.classList.remove(this.configuration.activeItemClass);
                }
                const currentInput = currentLi.querySelector('input');
                if (currentInput) currentInput.checked = selectState;
            }
        }

        retrieveOptionByValue(targetValue) { // Renamed from getOptionByValue
            return Array.from(this.originalElement.options).find(opt => opt.value === targetValue);
        }

        markAllChoices() { // Renamed from selectAll
            const optionsToSelect = Array.from(this.originalElement.options).filter(opt => !opt.disabled);
            optionsToSelect.forEach(opt => opt.selected = true);

            this.dropdownPanel.querySelectorAll('li:not(.multiselect-item.filter) input[type="checkbox"], li:not(.multiselect-item.filter) input[type="radio"]').forEach(input => {
                if (!input.disabled) {
                    input.checked = true;
                    input.closest('li').classList.add(this.configuration.activeItemClass);
                }
            });
            this.configuration.onGlobalSelect();
        }

        clearAllChoices() { // Renamed from deselectAll
            Array.from(this.originalElement.options).forEach(opt => opt.selected = false);

            this.dropdownPanel.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
                input.checked = false;
                input.closest('li').classList.remove(this.configuration.activeItemClass);
            });
        }

        refreshButtonLabel() { // Renamed from updateButtonText
            const selectedOriginalOptions = Array.from(this.originalElement.options).filter(opt => opt.selected);
            const buttonTextSpan = this.controlButton.querySelector('.multiselect-selected-text');
            if (buttonTextSpan) {
                buttonTextSpan.textContent = this.configuration.labelFormatter(selectedOriginalOptions, this.originalElement);
            }
            this.controlButton.title = this.configuration.tooltipFormatter(selectedOriginalOptions, this.originalElement);
        }

        synchronizeGlobalToggle() { // Renamed from updateSelectAll
            if (!this.configuration.includeGlobalToggleOption) return;

            const globalToggleInput = this.dropdownPanel.querySelector(`input[value="${this.configuration.globalToggleValue}"]`);
            if (!globalToggleInput) return;

            const totalOptions = this.originalElement.querySelectorAll('option:not([disabled])').length;
            const selectedOptions = this.originalElement.querySelectorAll('option:not([disabled]):checked').length;

            if (totalOptions > 0 && selectedOptions === totalOptions) {
                globalToggleInput.checked = true;
                globalToggleInput.closest('li').classList.add(this.configuration.activeItemClass);
            } else {
                globalToggleInput.checked = false;
                globalToggleInput.closest('li').classList.remove(this.configuration.activeItemClass);
            }
        }

        addGlobalSelectionToggle() { // Renamed from buildSelectAll
            if (!this.configuration.includeGlobalToggleOption || this.originalElement.options.length < this.configuration.globalToggleThreshold) {
                return;
            }

            const existingGlobalToggle = this.dropdownPanel.querySelector(`input[value="${this.configuration.globalToggleValue}"]`);
            if (existingGlobalToggle) return;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.configuration.uiTemplates.listItem;
            const listItem = tempDiv.firstElementChild;
            listItem.classList.add('multiselect-all');
            const anchor = listItem.firstElementChild;
            const label = anchor.firstElementChild;

            const inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
            inputElement.value = this.configuration.globalToggleValue;
            inputElement.name = this.configuration.globalToggleName || '';

            label.prepend(inputElement);
            label.appendChild(document.createTextNode(this.configuration.globalToggleText));

            this.dropdownPanel.prepend(listItem);
        }

        implementSearchFilter() { // Renamed from buildFilter
            if (!this.configuration.enableSearchFeature) {
                const existingFilter = this.dropdownPanel.querySelector('.multiselect-item.filter');
                if (existingFilter) existingFilter.remove();
                return;
            }

            let filterLi = this.dropdownPanel.querySelector('.multiselect-item.filter');
            if (filterLi) return;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.configuration.uiTemplates.search;
            filterLi = tempDiv.firstElementChild;

            const searchInput = filterLi.querySelector('.multiselect-search');
            searchInput.placeholder = this.configuration.searchPrompt;

            if (this.configuration.includeSearchClearButton) {
                const clearTempDiv = document.createElement('div');
                clearTempDiv.innerHTML = this.configuration.uiTemplates.searchClear;
                const clearButtonWrapper = clearTempDiv.firstElementChild;
                filterLi.querySelector('.input-group').appendChild(clearButtonWrapper);

                clearButtonWrapper.querySelector('.multiselect-clear-filter').addEventListener('click', () => {
                    searchInput.value = '';
                    this.currentSearchQuery = '';
                    this.applyFilterToChoices();
                });
            }

            searchInput.addEventListener('input', (event) => {
                clearTimeout(this.searchDelayTimer);
                this.searchDelayTimer = setTimeout(() => {
                    this.currentSearchQuery = event.target.value;
                    this.applyFilterToChoices();
                }, 300);
            });

            this.dropdownPanel.prepend(filterLi);
        }

        applyFilterToChoices() {
            const query = this.configuration.caseInsensitiveSearch ? this.currentSearchQuery.toLowerCase() : this.currentSearchQuery;

            this.dropdownPanel.querySelectorAll('li:not(.multiselect-item.filter):not(.multiselect-item.multiselect-all)').forEach(listItem => {
                const input = listItem.querySelector('input');
                if (!input) { // Could be a divider or optgroup
                    if (listItem.classList.contains('multiselect-item-divider')) {
                        listItem.style.display = 'none'; // Hide dividers by default if not part of a visible group
                    }
                    return;
                }

                const originalOption = this.retrieveOptionByValue(input.value);
                if (!originalOption) return;

                let match = false;
                const optionText = originalOption.textContent;
                const optionValue = originalOption.value;
                const optionLabel = originalOption.getAttribute('label');

                const checkMatch = (text) => {
                    return this.configuration.caseInsensitiveSearch ? text.toLowerCase().includes(query) : text.includes(query);
                };

                switch (this.configuration.searchMethod) {
                    case 'text':
                        match = checkMatch(optionText);
                        break;
                    case 'value':
                        match = checkMatch(optionValue);
                        break;
                    case 'both':
                        match = checkMatch(optionText) || checkMatch(optionValue);
                        break;
                    default:
                        match = checkMatch(optionText);
                }

                listItem.style.display = match ? '' : 'none';
            });

            // Handle optgroups after individual items are filtered
            this.dropdownPanel.querySelectorAll('.multiselect-item.multiselect-group').forEach(groupLi => {
                const childOptions = groupLi.querySelectorAll('li:not(.multiselect-item.multiselect-group)');
                const hasVisibleChild = Array.from(childOptions).some(child => child.style.display !== 'none');
                groupLi.style.display = hasVisibleChild ? '' : 'none';
            });
        }

        deactivateComponent() { // Renamed from disable
            this.controlButton.disabled = true;
            this.controlButton.classList.add('disabled');
        }

        activateComponent() { // Renamed from enable
            this.controlButton.disabled = false;
            this.controlButton.classList.remove('disabled');
        }
    }

    // Global function to instantiate or interact with ComplexChoiceMechanism
    window.initializeComplexChoice = function(targetElement, config, action, ...args) {
        if (typeof targetElement === 'string') {
            targetElement = document.querySelector(targetElement);
        }
        if (!targetElement || !(targetElement instanceof HTMLSelectElement)) {
            console.error('Invalid target element provided for ComplexChoiceMechanism.');
            return;
        }

        let instance = instanceRegistry.get(targetElement);

        if (typeof action === 'string' && instance) {
            const methodNameMap = {
                'setOptions': 'setConfiguration',
                'rebuild': 'reconstructView',
                'refresh': 'refreshDisplay',
                'destroy': 'dismantleComponent',
                'disable': 'deactivateComponent',
                'enable': 'activateComponent',
                'selectAll': 'markAllChoices',
                'deselectAll': 'clearAllChoices'
            };
            const mappedMethod = methodNameMap[action];
            if (mappedMethod && typeof instance[mappedMethod] === 'function') {
                instance[mappedMethod](...args);
            } else {
                console.warn(`Method '${action}' not found or not mapped for ComplexChoiceMechanism.`);
            }
            return instance;
        }

        if (!instance) {
            instance = new ComplexChoiceMechanism(targetElement, config);
            instanceRegistry.set(targetElement, instance);
        } else {
            if (config) {
                instance.setConfiguration(config);
                instance.reconstructView();
            }
        }
        return instance;
    };

})();