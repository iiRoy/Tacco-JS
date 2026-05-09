/*
 * jQuery DoubleSelectPanel plugin with Bootstrap styling v1.0
 * http://www.geodan.nl
 *
 * Copyright (c) 2014 Geodan B.V.
 * Created by: Alex van den Hoogen
 *
 * Usage guidelines:
 *   Initialize a <select> element and apply this script via jQuery like so:
 *   jq('select').DoubleSelectPanel(); - this will then construct the interactive panel.
 *
 *   Configuration parameters can be supplied through HTML5 data attributes or
 *   via a provided JavaScript object. Optionally, pre-selected items can
 *   also be supplied, and this script can fetch JSON data to populate the
 *   DoubleSelectPanel if a valid URI is given.
 *
 *   Refer to the default options (below) for a full list of configurable items.
 */

(function(jq) {
    /* Initializes the DoubleSelectPanel functionality as a jQuery plugin. */
    jq.fn.DoubleSelectPanel = function(configSettings, initialChoices) {
        return this.each(function () {
            // Default configuration values for the panel.
            var standardOpts = {
                sourceElement:    jq(this).context,    // The originating select element for this panel.
                dataSourcePath:   'local.json',        // JSON file path for data retrieval.
                valueField:       'id',                // Attribute name for the option's value.
                textField:        'name',              // Attribute name for the option's visible text.
                panelTitle:       'Sample Selection',  // Display title for the dual list panel.
                useJsonData:      true,                // Flag to determine if data should be fetched via JSON.
                searchDelay:      500,                 // Milliseconds timeout before filter search begins.
                horizontalLayout: false,              // Layout orientation: true for horizontal, false for vertical.
                maxTextDisplay:   45,                  // Maximum character length for displayed option text.
                enableMoveAll:    true,                // Determines if "move all" buttons are available.
                maxBulkMove:      500,                 // Threshold for items where "move all" triggers a warning.
                bulkWarningMsg:   'Are you certain you wish to transfer this many items? This action might cause your browser to become unresponsive.'
            };

            // Configuration extracted from HTML data attributes.
            var markupOpts = {
                sourceElement:    jq(this).context,
                dataSourcePath:   jq(this).data('source'),
                valueField:       jq(this).data('value'),
                textField:        jq(this).data('text'),
                panelTitle:       jq(this).data('title'),
                useJsonData:      jq(this).data('json'),
                searchDelay:      jq(this).data('timeout'),
                horizontalLayout: jq(this).data('horizontal'),
                maxTextDisplay:   jq(this).data('textLength'),
                enableMoveAll:    jq(this).data('moveAllBtn'),
                maxBulkMove:      jq(this).data('maxAllBtn')
            };

            // Merge all configuration sources: defaults, HTML attributes, and explicit parameters.
            var settings = jq.extend({}, standardOpts, markupOpts, configSettings);

            // Validate essential settings.
            jq.each(settings, function(identifier, val) {
                if (val === undefined || val === null) { throw 'DoubleSelectPanel: Configuration property "' + identifier + '" is undefined or null.'; }
            });

            // Derive parent container identifiers.
            settings['panelId'] = 'double-select-panel-' + settings.panelTitle.replace(/\s/g, '');
            settings['containerSelector'] = '#' + settings.panelId;

            // Ensure initial choices are an array.
            initialChoices = jq.extend([{}], initialChoices);

            // Determine data loading strategy.
            if (settings.useJsonData) {
                populateFromJSON(settings, initialChoices);
            } else {
                buildPanel(settings);
            }
        })
    };

    /* Fetches all option elements using a JSON request. */
    function populateFromJSON(currentSettings, preselectedItems) {
        var multipleDisplayFields = false;

        if (currentSettings.textField.indexOf(':') > -1) {
            var displayFields = currentSettings.textField.split(':');

            if (displayFields.length > 1) {
                multipleDisplayFields = true;
            }
        }

        jq.getJSON(currentSettings.dataSourcePath, function(jsonData) {
            jq.each(jsonData, function(idx, dataItem) {
                var itemLabel = '';

                if (multipleDisplayFields) {
                    displayFields.forEach(function (fieldKey) { itemLabel += dataItem[fieldKey] + ' '; });
                } else {
                    itemLabel = dataItem[currentSettings.textField];
                }

                jq('<option>', {
                    value: dataItem[currentSettings.valueField],
                    text: itemLabel,
                    selected: (preselectedItems.some(function (chosen) { return chosen[currentSettings.valueField] === dataItem[currentSettings.valueField] }) === true)
                }).appendTo(currentSettings.sourceElement);
            });

            buildPanel(currentSettings);
        });
    }

    /* Attaches event handlers to the control buttons and filter inputs. */
    function attachEventHandlers(currentSettings) {
        var availableItems = jq(currentSettings.containerSelector + ' .available-options');
        var chosenItems = jq(currentSettings.containerSelector + ' .selected-options');

        jq(currentSettings.containerSelector).find('button').bind('click', function() {
            switch (jq(this).data('action-type')) {
                case 'move-right-selected': // Move selected to the right panel.
                    availableItems.find('option:selected').appendTo(chosenItems);
                    jq(this).prop('disabled', true);
                    break;
                case 'move-right-all': // Move all visible to the right panel.
                    if (availableItems.find('option').length >= currentSettings.maxBulkMove && confirm(currentSettings.bulkWarningMsg) ||
                        availableItems.find('option').length < currentSettings.maxBulkMove) {
                        availableItems.find('option').each(function () {
                            if (jq(this).isDisplayVisible()) {
                                jq(this).remove().appendTo(chosenItems);
                            }
                        });
                    }
                    break;
                case 'move-left-selected': // Move selected to the left panel.
                    chosenItems.find('option:selected').remove().appendTo(availableItems);
                    jq(this).prop('disabled', true);
                    break;
                case 'move-left-all': // Move all visible to the left panel.
                    if (chosenItems.find('option').length >= currentSettings.maxBulkMove && confirm(currentSettings.bulkWarningMsg) ||
                        chosenItems.find('option').length < currentSettings.maxBulkMove) {
                        chosenItems.find('option').each(function () {
                            if (jq(this).isDisplayVisible()) {
                                jq(this).remove().appendTo(availableItems);
                            }
                        });
                    }
                    break;
                default:
                    // No specific action defined for this button type.
                    break;
            }

            // Re-filter and sort both panels after movement.
            availableItems.filterOptionsByInput(jq(currentSettings.containerSelector + ' .filter-available'), currentSettings.searchDelay, currentSettings.containerSelector).scrollTop(0).sortPanelOptions();
            chosenItems.filterOptionsByInput(jq(currentSettings.containerSelector + ' .filter-selected'), currentSettings.searchDelay, currentSettings.containerSelector).scrollTop(0).sortPanelOptions();

            managePanelState(currentSettings);
        });

        // On form submission, ensure all chosen items are selected in the hidden select.
        jq(currentSettings.containerSelector).closest('form').submit(function() {
            chosenItems.find('option').prop('selected', true);
        });

        // Prevent form submission on Enter key in filter fields.
        jq(currentSettings.containerSelector).find('input[type="text"]').keypress(function(evt) {
            if (evt.which === 13) {
                evt.preventDefault();
            }
        });

        // Initial filter and sort application.
        chosenItems.filterOptionsByInput(jq(currentSettings.containerSelector + ' .filter-selected'), currentSettings.searchDelay, currentSettings.containerSelector).scrollTop(0).sortPanelOptions();
        availableItems.filterOptionsByInput(jq(currentSettings.containerSelector + ' .filter-available'), currentSettings.searchDelay, currentSettings.containerSelector).scrollTop(0).sortPanelOptions();
    }

    /* Builds the jQuery plugin interface after data elements are ready. */
    function buildPanel(currentSettings) {
        generatePanelMarkup(currentSettings);
        processInitialSelect(currentSettings);
        attachEventHandlers(currentSettings);
    }

    /* Updates and displays the count of elements in each list box. */
    function updateItemCounts(panelContainerSelector) {
        var countAvailable = 0, countChosen = 0;

        jq(panelContainerSelector + ' .available-options').find('option').each(function() { if (jq(this).isDisplayVisible()) { countAvailable++; } });
        jq(panelContainerSelector + ' .selected-options').find('option').each(function() { if (jq(this).isDisplayVisible()) { countChosen++ } });

        jq(panelContainerSelector + ' .available-count').text(countAvailable);
        jq(panelContainerSelector + ' .selected-count').text(countChosen);

        adjustButtonStates(panelContainerSelector);
    }

    /* Creates the visual structure of the dual list box including buttons and filters. */
    function generatePanelMarkup(currentSettings) {
        jq(currentSettings.sourceElement).parent().attr('id', currentSettings.panelId);

        jq(currentSettings.containerSelector).addClass('row').append(
                (currentSettings.horizontalLayout == false ? '   <div class="col-md-5">' : '   <div class="col-md-6">') +
                '       <h4><span class="available-title"></span> <small>- showing <span class="available-count"></span></small></h4>' +
                '       <input class="filter form-control filter-available" type="text" placeholder="Filter items..." style="margin-bottom: 5px;">' +
                (currentSettings.horizontalLayout == false ? '' : makeHorizontalButtons(1, currentSettings.enableMoveAll)) +
                '       <select class="available-options" style="height: 200px; width: 100%;" multiple></select>' +
                '   </div>' +
                (currentSettings.horizontalLayout == false ? makeVerticalButtons(currentSettings.enableMoveAll) : '') +
                (currentSettings.horizontalLayout == false ? '   <div class="col-md-5">' : '   <div class="col-md-6">') +
                '       <h4><span class="selected-title"></span> <small>- showing <span class="selected-count"></span></small></h4>' +
                '       <input class="filter form-control filter-selected" type="text" placeholder="Filter items..." style="margin-bottom: 5px;">' +
                (currentSettings.horizontalLayout == false ? '' : makeHorizontalButtons(2, currentSettings.enableMoveAll)) +
                '       <select class="selected-options" style="height: 200px; width: 100%;" multiple></select>' +
                '   </div>');

        jq(currentSettings.containerSelector + ' .selected-options').prop('name', jq(currentSettings.sourceElement).prop('name'));
        jq(currentSettings.containerSelector + ' .available-title').text('Available ' + currentSettings.panelTitle);
        jq(currentSettings.containerSelector + ' .selected-title').text('Chosen ' + currentSettings.panelTitle);
    }

    /* Generates the control buttons for horizontal layout mode. */
    function makeHorizontalButtons(panelNumber, includeAllButton) {
        if (panelNumber == 1) { // Buttons for moving from left to right.
            return (includeAllButton ? '       <button type="button" class="btn btn-default move-all-right" data-action-type="move-right-all" style="margin-bottom: 5px;"><span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span></button>': '') +
                '       <button type="button" class="btn btn-default ' + (includeAllButton ? 'pull-right col-md-6' : 'col-md-12') + ' move-selected-right" data-action-type="move-right-selected" style="margin-bottom: 5px;" disabled><span class="glyphicon glyphicon-chevron-right"></span></button>';
        } else { // Buttons for moving from right to left.
            return '       <button type="button" class="btn btn-default ' + (includeAllButton ? 'col-md-6' : 'col-md-12') + ' move-selected-left" data-action-type="move-left-selected" style="margin-bottom: 5px;" disabled><span class="glyphicon glyphicon-chevron-left"></span></button>' +
                (includeAllButton ? '       <button type="button" class="btn btn-default col-md-6 pull-right move-all-left" data-action-type="move-left-all" style="margin-bottom: 5px;"><span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span></button>' : '');
        }
    }

    /* Generates the control buttons for vertical layout mode. */
    function makeVerticalButtons(includeAllButton) {
        return '   <div class="col-md-2 text-center" style="margin-top: ' + (includeAllButton ? '80px' : '130px') +'">' +
            (includeAllButton ? '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-all-right" data-action-type="move-right-all" style="margin-bottom: 10px;"><span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span></button>' : '') +
            '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-selected-right" data-action-type="move-right-selected" style="margin-bottom: 20px;" disabled><span class="glyphicon glyphicon-chevron-right"></span></button>' +
            '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-selected-left" data-action-type="move-left-selected" style="margin-bottom: 10px;" disabled><span class="glyphicon glyphicon-chevron-left"></span></button>' +
            (includeAllButton ? '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 move-all-left" data-action-type="move-left-all" style="margin-bottom: 10px;"><span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span></button>' : '') +
            '   </div>';
    }

    /* Handles the state updates after items are moved between panels. */
    function managePanelState(currentSettings) {
        // Deselect any currently selected options in both panels.
        jq(currentSettings.containerSelector + ' .available-options').find('option:selected').prop('selected', false);
        jq(currentSettings.containerSelector + ' .selected-options').find('option:selected').prop('selected', false);

        // Clear any active filters and show all options.
        jq(currentSettings.containerSelector + ' .filter').val('');
        jq(currentSettings.containerSelector + ' select').find('option').each(function() { jq(this).show(); });

        // Recalculate and display item counts.
        updateItemCounts(currentSettings.containerSelector);
    }

    /* Processes the initial <select> element and distributes its options. */
    function processInitialSelect(currentSettings) {
        var textExceedsLimit = false;

        jq(currentSettings.sourceElement).find('option').text(function (index, currentText) {
            jq(this).data('original-title', currentText); // Store original text for tooltip.

            if (currentText.length > currentSettings.maxTextDisplay) {
                textExceedsLimit = true;
                return currentText.substr(0, currentSettings.maxTextDisplay) + '...';
            }
        }).each(function () {
            if (textExceedsLimit) {
                jq(this).prop('title', jq(this).data('original-title'));
            }

            // Distribute options to chosen or available panel based on initial selection.
            if (jq(this).is(':selected')) {
                jq(this).appendTo(currentSettings.containerSelector + ' .selected-options');
            } else {
                jq(this).appendTo(currentSettings.containerSelector + ' .available-options');
            }
        });

        // Remove the original select element as it's replaced by the dual panel.
        jq(currentSettings.sourceElement).remove();
        managePanelState(currentSettings); // Update counts and button states.
    }

    /* Enables or disables buttons based on the number of options in each panel. */
    function adjustButtonStates(panelContainerSelector) {
        // Enable 'move right selected' button when an item is selected in the available panel.
        jq(panelContainerSelector + ' .available-options').change(function() {
            jq(panelContainerSelector + ' .move-selected-right').prop('disabled', false);
        });

        // Enable 'move left selected' button when an item is selected in the chosen panel.
        jq(panelContainerSelector + ' .selected-options').change(function() {
            jq(panelContainerSelector + ' .move-selected-left').prop('disabled', false);
        });

        // Adjust 'move all' and 'move selected' buttons for the available panel.
        if (jq(panelContainerSelector + ' .available-options').has('option').length == 0) {
            jq(panelContainerSelector + ' .move-all-right').prop('disabled', true);
            jq(panelContainerSelector + ' .move-selected-right').prop('disabled', true);
        } else {
            jq(panelContainerSelector + ' .move-all-right').prop('disabled', false);
        }

        // Adjust 'move all' and 'move selected' buttons for the chosen panel.
        if (jq(panelContainerSelector + ' .selected-options').has('option').length == 0) {
            jq(panelContainerSelector + ' .move-all-left').prop('disabled', true);
            jq(panelContainerSelector + ' .move-selected-left').prop('disabled', true);
        } else {
            jq(panelContainerSelector + ' .move-all-left').prop('disabled', false);
        }
    }

    /*
     * Filters options within select boxes based on text input and hides non-matching elements.
     *
     * Inspired by: http://www.lessanvaezi.com/filter-select-list-options/
     */
    jq.fn.filterOptionsByInput = function(inputField, delayMs, panelContainerSelector) {
        return this.each(function() {
            var targetSelect = this;
            var cachedOptions = [];

            // Cache all options with their values and texts.
            jq(targetSelect).find('option').each(function() {
                cachedOptions.push({optionValue: jq(this).val(), optionText: jq(this).text()});
            });

            jq(targetSelect).data('cachedOptions', cachedOptions);

            // Bind filter logic to change and keyup events with a debounce.
            jq(inputField).bind('change keyup', function() {
                debounceFunction(function() {
                    var currentOptions = jq(targetSelect).data('cachedOptions');
                    var searchTerm = jq.trim(jq(inputField).val());
                    var searchRegex = new RegExp(searchTerm,'gi');

                    jq.each(currentOptions, function(index) {
                        if(currentOptions[index].optionText.match(searchRegex) === null) {
                            jq(targetSelect).find(jq('option[value="' + currentOptions[index].optionValue + '"]')).hide();
                        } else {
                            jq(targetSelect).find(jq('option[value="' + currentOptions[index].optionValue + '"]')).show();
                        }
                    });

                    updateItemCounts(panelContainerSelector); // Refresh counts after filtering.
                }, delayMs);
            });
        });
    };

    /* Custom jQuery method to check if an element is visually displayed.
     * The standard jQuery :visible pseudo-selector might not always behave as expected
     * for elements hidden by `display: none` vs `visibility: hidden`. */
    jq.fn.isDisplayVisible = function() {
        return !(jq(this).css('visibility') == 'hidden' || jq(this).css('display') == 'none');
    };

    /* Sorts options within a select/list box alphabetically by text content. */
    jq.fn.sortPanelOptions = function() {
        return this.each(function() {
            jq(this).append(jq(this).find('option').remove().sort(function(a, b) {
                var textA = jq(a).text(), textB = jq(b).text();
                return (textA > textB) ? 1 : ((textA < textB) ? -1 : 0);
            }));
        });
    };

    /* A simple debounce utility function to limit the rate at which a function is called. */
    var debounceFunction = (function() {
        var timerHandle = 0;
        return function (fnCallback, milliseconds) {
            clearTimeout(timerHandle);
            timerHandle = setTimeout(fnCallback, milliseconds);
        };
    })();
})(jQuery);