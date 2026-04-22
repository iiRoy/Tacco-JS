// This file is a modified version of an open-source library.
// All original licensing and copyright information is replaced with a generic placeholder.
//
// Placeholder License Information:
// This modified code is provided under a generic open-source license.
// Users are encouraged to review the original project for full licensing details.
// Any use of this code should respect the terms of the original software.
//
// No warranties are provided, and the authors are not liable for any damages.
// Use at your own risk.
//
// (This is a placeholder and does not constitute a real license.
// For actual use, please refer to the original project's license.)
(function (jq) {
    "use strict"; // Enforce strict mode for better code quality.

    if (typeof observableFramework !== 'undefined' && observableFramework.dataBinders && !observableFramework.dataBinders.optionChooser) {
        observableFramework.dataBinders.optionChooser = {
            subsequent: ['choices', 'currentValue', 'chosenSelections'],

            initialize: function (domElement, valueRetriever, allConfigurations, modelView, contextInfo) {
                var jqElement = jq(domElement);
                var settings = observableFramework.toJS(valueRetriever());

                jqElement.optionChooser(settings);

                if (allConfigurations.has('choices')) {
                    var choices = allConfigurations.get('choices');
                    if (observableFramework.isReactive(choices)) {
                        observableFramework.computedProperty({
                            read: function () {
                                choices();
                                deferExecution(function () {
                                    var selectionTool = jqElement.data('optionChooser');
                                    if (selectionTool)
                                        selectionTool.syncInitialChoices(); // Refresh initial choice data.
                                    jqElement.optionChooser('reconstruct');
                                }, 1);
                            },
                            cleanupOnNodeRemoval: domElement
                        });
                    }
                }

                // Value and selected options are two-way, so these will be triggered even by our own actions.
                // It needs some way to tell if they are triggered because of us or because of outside change.
                // It doesn't loop but it's a waste of processing.
                if (allConfigurations.has('currentValue')) {
                    var currentValue = allConfigurations.get('currentValue');
                    if (observableFramework.isReactive(currentValue)) {
                        observableFramework.computedProperty({
                            read: function () {
                                currentValue();
                                deferExecution(function () {
                                    jqElement.optionChooser('updateView');
                                }, 1);
                            },
                            cleanupOnNodeRemoval: domElement
                        }).extend({
                            throttleDuration: 100,
                            notifyOnStableChanges: true
                        });
                    }
                }

                // Switched from arrayChange subscription to general subscription using 'updateView'.
                // Not sure performance is any better using 'select' and 'deselect'.
                if (allConfigurations.has('chosenSelections')) {
                    var chosenSelections = allConfigurations.get('chosenSelections');
                    if (observableFramework.isReactive(chosenSelections)) {
                        observableFramework.computedProperty({
                            read: function () {
                                chosenSelections();
                                deferExecution(function () {
                                    jqElement.optionChooser('updateView');
                                }, 1);
                            },
                            cleanupOnNodeRemoval: domElement
                        }).extend({
                            throttleDuration: 100,
                            notifyOnStableChanges: true
                        });
                    }
                }

                observableFramework.utilities.elementCleanup.addDisposalHook(domElement, function () {
                    jqElement.optionChooser('decommission');
                });
            },

            refreshDisplay: function (domElement, valueRetriever, allConfigurations, modelView, contextInfo) {
                var jqElement = jq(domElement);
                var settings = observableFramework.toJS(valueRetriever());

                jqElement.optionChooser('setConfigurations', settings);
                jqElement.optionChooser('reconstruct');
            }
        };
    }

    function iterateArray(collection, processFunction) {
        var idx;
        for (idx = 0; idx < collection.length; ++idx) {
            processFunction(collection[idx], idx);
        }
    }

    /**
     * Constructs a new selection handling component using the given dropdown.
     *
     * @param {jQuery} targetDropdown The target select element.
     * @param {Object} configuration  Options for the component.
     * @returns {SelectionHandler} An instance of the selection handler.
     */
    function SelectionHandler(targetDropdown, configuration) {

        this.targetElement = jq(targetDropdown);
        this.currentSettings = this.combineConfigurations(jq.extend({}, configuration, this.targetElement.data()));

        // Component initialization.
        // We clone the original to create a distinct reference.
        this.initialChoices = this.targetElement.clone()[0].options;
        this.searchQuery = '';
        this.searchDelayHandle = null;
        this.lastInteractionItem = null

        this.currentSettings.multiChoiceMode = this.targetElement.attr('multiple') === "multiple";
        this.currentSettings.selectionChangedCallback = jq.proxy(this.currentSettings.selectionChangedCallback, this);
        this.currentSettings.onMenuShow = jq.proxy(this.currentSettings.onMenuShow, this);
        this.currentSettings.onMenuHide = jq.proxy(this.currentSettings.onMenuHide, this);
        this.currentSettings.onMenuShown = jq.proxy(this.currentSettings.onMenuShown, this);
        this.currentSettings.onMenuHidden = jq.proxy(this.currentSettings.onMenuHidden, this);

        // Assemble the various parts of the component.
        this.createWrapper();
        this.generateControl();
        this.constructMenu();
        this.addSelectAllOption(); // Placeholder for a renamed method.
        this.populateMenuChoices();
        this.createFilterComponent(); // Placeholder for a renamed method.

        this.refreshButtonLabel();
        this.synchronizeSelectAll();

        if (this.currentSettings.deactivateIfNoItems && jq('option', this.targetElement).length <= 0) {
            this.deactivate();
        }

        this.targetElement.hide().after(this.mainContainer);
    };

    SelectionHandler.prototype = {

        standardSettings: {
            /**
             * The default text generation function will either display 'Nothing selected'
             * if no items are chosen, or a list of selected items up to a certain count.
             *
             * @param {jQuery} chosenItems    The currently selected options.
             * @param {jQuery} sourceElement  The original select element.
             * @returns {String} The text to display on the button.
             */
            controlLabel: function (chosenItems, sourceElement) {
                if (chosenItems.length === 0) {
                    return this.noSelectionLabel;
                } else if (this.allChosenLabel && chosenItems.length == jq('option', jq(sourceElement)).length) {
                    if (this.displaySelectAllCount) {
                        return this.allChosenLabel + ' (' + chosenItems.length + ')';
                    } else {
                        return this.allChosenLabel;
                    }
                } else if (chosenItems.length > this.displayThreshold) {
                    return chosenItems.length + ' ' + this.itemsSelectedLabel;
                } else {
                    var outputString = '';
                    chosenItems.each(function () {
                        var itemLabel = (jq(this).attr('itemDisplayLabel') !== undefined) ? jq(this).attr('itemDisplayLabel') : jq(this).text();

                        outputString += itemLabel + ', ';
                    });

                    return outputString.substring(0, outputString.length - 2);
                }
            },
            /**
             * Updates the title attribute of the button, similar to the controlLabel function.
             *
             * @param {jQuery} chosenItems    The selected items.
             * @param {jQuery} sourceElement  The original select element.
             * @returns {String} The title string.
             */
            controlTooltip: function (chosenItems, sourceElement) {
                if (chosenItems.length === 0) {
                    return this.noSelectionLabel;
                } else {
                    var outputString = '';
                    chosenItems.each(function () {
                        outputString += jq(this).text() + ', ';
                    });
                    return outputString.substring(0, outputString.length - 2);
                }
            },
            /**
             * Creates a display label for an option element.
             *
             * @param {jQuery} domItem The DOM element for the option.
             * @returns {String} The label text.
             */
            itemDisplayLabel: function (domItem) {
                return jq(domItem).attr('itemDisplayLabel') || jq(domItem).text();
            },
            /**
             * Triggered when the multiselect's selection changes.
             *
             * Not triggered when selecting/deselecting options manually.
             *
             * @param {jQuery} itemOption The option element that changed.
             * @param {Boolean} isChecked Whether the option is now checked.
             */
            selectionChangedCallback: function (itemOption, isChecked) {

            },
            /**
             * Fired when the dropdown menu begins to show.
             *
             * @param {jQuery} eventObject The event data.
             */
            onMenuShow: function (eventObject) {

            },
            /**
             * Fired when the dropdown menu begins to hide.
             *
             * @param {jQuery} eventObject The event data.
             */
            onMenuHide: function (eventObject) {

            },
            /**
             * Fired after the dropdown menu has fully shown.
             *
             * @param {jQuery} eventObject The event data.
             */
            onMenuShown: function (eventObject) {

            },
            /**
             * Fired after the dropdown menu has fully hidden.
             *
             * @param {jQuery} eventObject The event data.
             */
            onMenuHidden: function (eventObject) {

            },
            /**
             * Fired when the 'select all' option is used.
             */
            onAllSelected: function () {

            },
            controlStyling: 'btn btn-default',
            shouldInheritClass: false,
            controlWidth: 'auto',
            controlWrapper: '<div class="btn-group" />',
            alignRight: false,
            activeItemClass: 'active',
            // Maximum pixel height of the dropdown menu.
            // If this height is exceeded, a scrollbar will appear.
            maximumMenuHeight: false,
            checkboxIdentifier: false,
            includeAllSelectionOption: false,
            includeAllSelectionThreshold: 0,
            selectAllDisplay: ' Choose all',
            selectAllItemValue: 'selection-all',
            selectAllCheckboxName: false,
            displaySelectAllCount: true,
            allowFiltering: false,
            allowCaseInsensitiveFiltering: false,
            makeOptGroupsClickable: false,
            filterInputPlaceholder: 'Find items',
            // Possible search behaviors: 'text', 'value', 'both'
            filterSearchBehavior: 'text',
            addFilterClearButton: true,
            preventInputEventTrigger: false,
            noItemsChosenText: 'Nothing selected',
            itemsCountSelectedText: 'chosen',
            allItemsChosenText: 'All items chosen',
            displaySelectedCount: 3,
            disableWhenEmpty: false,
            markupTemplates: {
                controlMarkup: '<button type="button" class="optionChooser dropdown-toggle" data-toggle="dropdown"><span class="optionChooser-selected-text"></span> <b class="caret"></b></button>',
                listMarkup: '<ul class="optionChooser-container dropdown-menu"></ul>',
                filterInputMarkup: '<li class="optionChooser-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control optionChooser-search" type="text"></div></li>',
                clearFilterButtonMarkup: '<span class="input-group-btn"><button class="btn btn-default optionChooser-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                listItemMarkup: '<li><a tabindex="0"><label></label></a></li>',
                separatorMarkup: '<li class="optionChooser-item separator"></li>',
                listGroupMarkup: '<li class="optionChooser-item optionChooser-group"><label></label></li>'
            }
        },

        initializer: SelectionHandler,

        /**
         * Assembles the main wrapper element for the component.
         */
        createWrapperElement: function () {
            this.mainContainer = jq(this.currentSettings.controlWrapper);
            this.mainContainer.on('showing.bs.panel', this.currentSettings.onMenuShow);
            this.mainContainer.on('hiding.bs.panel', this.currentSettings.onMenuHide);
            this.mainContainer.on('shown.bs.panel', this.currentSettings.onMenuShown);
            this.mainContainer.on('hidden.bs.panel', this.currentSettings.onMenuHidden);
        },

        /**
         * Constructs the interactive button element for the component.
         */
        createControlElement: function () {
            this.controlElement = jq(this.currentSettings.markupTemplates.controlMarkup).addStyleClass(this.currentSettings.controlStyling);
            if (this.targetElement.attr('className') && this.currentSettings.shouldInheritClass) {
                this.controlElement.addStyleClass(this.targetElement.attr('className'));
            }
            // Adopt the disabled state from the source element.
            if (this.targetElement.attr('isDisabled')) {
                this.deactivate();
            } else {
                this.activate();
            }

            // Manually set button width if a specific value is provided.
            if (this.currentSettings.controlWidth && this.currentSettings.controlWidth !== 'auto') {
                this.controlElement.applyStyle({
                    'width': this.currentSettings.controlWidth,
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                });
                this.mainContainer.applyStyle({
                    'width': this.currentSettings.controlWidth
                });
            }

            // Preserve the tab index from the original select.
            var tabOrder = this.targetElement.attr('tabOrder');
            if (tabOrder) {
                this.controlElement.attr('tabOrder', tabOrder);
            }

            this.mainContainer.insertAtStart(this.controlElement);
        },

        /**
         * Builds the unordered list that serves as the dropdown menu.
         */
        createDropdownMenu: function () {

            // Create the UL element.
            this.menuList = jq(this.currentSettings.markupTemplates.listMarkup);

            if (this.currentSettings.alignMenuRight) {
                this.menuList.addStyleClass('pull-right');
            }

            // Apply max height to the dropdown menu to enable scrolling.
            if (this.currentSettings.maximumDropdownHeight) {
                // TODO: Consider adding a dedicated class for styling this option.
                this.menuList.applyStyle({
                    'max-height': this.currentSettings.maximumDropdownHeight + 'px',
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden'
                });
            }

            this.mainContainer.addToEnd(this.menuList);
        },

        /**
         * Populates the dropdown menu with options and attaches necessary event listeners.
         *
         * Utilizes generateDivider and generateOptionItem to create the individual menu elements.
         */
        populateDropdownOptions: function () {

            this.targetElement.children().each(jq.proxy(function (idx, childElement) {

                var currentChild = jq(childElement);
                // Supports both option groups and standalone options.
                var nodeName = currentChild.getProperty('nodeName')
                    .toLower();

                if (currentChild.getProperty('valueAttribute') === this.currentSettings.allSelectionValue) {
                    return;
                }

                if (nodeName === 'optionGroup') {
                    this.generateOptionGroup(childElement);
                } else if (nodeName === 'singleOption') {

                    if (currentChild.getData('purpose') === 'separator') {
                        this.generateDivider();
                    } else {
                        this.generateOptionItem(childElement);
                    }

                }

                // Any other unrecognized tags will be ignored.
            }, this));

            // Attach the change event handler to the dropdown's input elements.
            jq('li input', this.menuList).on('changeEvent', jq.proxy(function (eventObject) {
                var interactionTarget = jq(eventObject.targetElement);

                var isChecked = interactionTarget.attr('isChecked') || false;
                var isAllSelectionItem = interactionTarget.val() === this.currentSettings.allSelectionValue;

                // Apply or remove the configured active class.
                if (this.currentSettings.activeChoiceClass) {
                    if (isChecked) {
                        interactionTarget.findAncestor('listItem')
                            .addStyleClass(this.currentSettings.activeChoiceClass);
                    } else {
                        interactionTarget.findAncestor('listItem')
                            .removeStyleClass(this.currentSettings.activeChoiceClass);
                    }
                }

                // Retrieve the corresponding select option.
                var itemValue = interactionTarget.val();
                var matchedOption = this.retrieveOptionByValue(itemValue);

                var otherOptions = jq('option', this.targetElement).not(matchedOption);
                var otherCheckboxes = jq('input', this.mainContainer).not(interactionTarget);

                if (isAllSelectionItem) {
                    if (isChecked) {
                        this.markAllSelected();
                    } else {
                        this.unmarkAllSelected();
                    }
                }

                if (!isAllSelectionItem) {
                    if (isChecked) {
                        matchedOption.attr('selectedState', true);

                        if (this.currentSettings.multiChoiceMode) {
                            // Just select the additional item.
                            matchedOption.attr('selectedState', true);
                        } else {
                            // Deselect all other options and their corresponding checkboxes.
                            if (this.currentSettings.activeChoiceClass) {
                                jq(otherCheckboxes).findAncestor('listItem').removeStyleClass(this.currentSettings.activeChoiceClass);
                            }

                            jq(otherCheckboxes).attr('isChecked', false);
                            otherOptions.attr('selectedState', false);

                            // For single selection, close the dropdown.
                            this.controlElement.trigger('clickEvt');
                        }

                        if (this.currentSettings.activeChoiceClass === "active") {
                            otherOptions.findAncestor("linkTag").applyStyle("borderOutline", "");
                        }
                    } else {