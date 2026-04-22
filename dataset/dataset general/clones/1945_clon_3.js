/*
 * JsonDataTree - A jQuery-based utility for rendering JSON data into an interactive HTML tree structure.
 * Version 1.0.0
 *
 * Copyright (c) 2010 Francois Lafortune (quickredfox.at) - Original concept
 * Refactored and extended by [Your Name/Company Here] in 2023.
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * This plugin takes a JSON object and transforms it into a collapsible, human-readable HTML representation.
 * It supports objects, arrays, strings, numbers, booleans, and null values.
 *
 * Usage Example:
 *  <html>
 *  <head>
 *      <link rel="stylesheet" href="data-visualizer.css" type="text/css" />
 *      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js" type="text/javascript"></script>
 *      <script src="jquery.data-tree.js" type="text/javascript"></script>
 *      <script type="text/javascript" charset="utf-8">
 *          // Ensure the DOM is fully loaded before executing scripts
 *          $(function(){
 *              // Fetch some JSON data from a remote source
 *              $.getJSON('sample-data.json', function(dataPayload){
 *                  // Render the JSON data into the document body using the plugin
 *                  $('#dataContainer').displayDataTree(dataPayload, {
 *                      initialCollapseLevel: 1 // Optional: Collapse nodes beyond level 1 by default
 *                  });
 *              }).fail(function(jqxhr, textStatus, error) {
 *                  var err = textStatus + ", " + error;
 *                  console.error("Request Failed: " + err);
 *              });
 *          });
 *      </script>
 *  </head>
 *  <body>
 *      <div id="dataContainer"></div>
 *  </body>
 *  </html>
*/

(function($){ // Encapsulate with jQuery alias to prevent conflicts

    // Default configuration options for the plugin. These can be overridden per instance.
    const defaultSettings = {
        initialCollapseLevel: -1, // -1: fully expanded, 0: top-level only, 1: level 1 collapsed, etc.
        emptyArrayText: '[ Empty List ]',
        emptyObjectText: '{ Empty Map }',
        rootContainerClass: 'data-visualizer-root',
        listContainerClass: 'list-container',
        mapContainerClass: 'map-container',
        listItemClass: 'list-item-entry',
        mapPropertyClass: 'map-property-entry',
        keyLabelClass: 'property-key-label',
        valueContentClass: 'property-value-content',
        textValueClass: 'text-value-display',
        numberValueClass: 'number-value-display',
        booleanValueClass: 'boolean-value-display',
        nullValueClass: 'null-display-value',
        toggleButtonClass: 'tree-node-expander',
        collapsedClass: 'collapsed',
        expandedClass: 'expanded',
        unhandledTypeClass: 'unhandled-value-display'
    };

    /**
     * jQuery plugin method to display JSON data as an interactive HTML tree.
     * @param {object} inputData - The JSON data to be rendered.
     * @param {object} [options] - Optional settings to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.displayDataTree = function(inputData, options = {}) {
        const currentSettings = $.extend({}, defaultSettings, options);
        const $targetElement = $(this);

        // Guard clause: If no valid data is provided, display an error message.
        if (inputData === null || (typeof inputData !== 'object' && !Array.isArray(inputData))) {
            $targetElement.html('<div class="data-visualizer-error">Invalid or no data provided for visualization. Expected object or array.</div>');
            return $targetElement;
        }

        // Generate the HTML markup from the JSON data, starting at nesting level 0.
        const renderedOutput = `<div class="${currentSettings.rootContainerClass}">${processDataToHtml(inputData, 0, currentSettings)}</div>`;

        // Inject the generated HTML into the target element and return for chaining.
        return $targetElement.html(renderedOutput);
    };

    /**
     * Recursively converts a JSON data node into HTML markup.
     * This function handles different data types and builds the tree structure.
     * @param {*} currentNodeValue - The current data node (object, array, primitive).
     * @param {number} currentNestingLevel - The current depth in the data tree, starting from 0.
     * @param {object} settings - The plugin's current configuration settings.
     * @returns {string} The HTML string representation of the data node.
     */
    function processDataToHtml(currentNodeValue, currentNestingLevel, settings) {
        let htmlSegments = [];

        // Determine if the current node should be collapsed based on initialCollapseLevel setting.
        const shouldBeCollapsed = settings.initialCollapseLevel !== -1 && currentNestingLevel >= settings.initialCollapseLevel;
        const visibilityStyle = shouldBeCollapsed ? 'display: none;' : '';
        const collapseExpandClass = shouldBeCollapsed ? settings.collapsedClass : settings.expandedClass;

        // Helper function to generate a toggle button HTML snippet.
        const generateToggleButton = (isInitiallyCollapsed) =>
            `<a href="#" class="${settings.toggleButtonClass}" data-initial-state="${isInitiallyCollapsed ? 'collapsed' : 'expanded'}">${isInitiallyCollapsed ? '[+]' : '[-]'}</a>`;

        // Handle different data types by type checking.
        if (currentNodeValue === null) {
            htmlSegments.push(`<p class="${settings.nullValueClass}">null</p>`);
        } else if (typeof currentNodeValue === 'boolean') {
            htmlSegments.push(`<p class="${settings.booleanValueClass}">${currentNodeValue.toString()}</p>`);
        } else if (typeof currentNodeValue === 'number') {
            htmlSegments.push(`<p class="${settings.numberValueClass}">${currentNodeValue.toString()}</p>`);
        } else if (typeof currentNodeValue === 'string') {
            // Escape HTML entities to prevent XSS vulnerabilities and display special characters correctly.
            const escapedString = $('<div/>').text(currentNodeValue).html();
            htmlSegments.push(`<p class="${settings.textValueClass}">${escapedString}</p>`);
        } else if (Array.isArray(currentNodeValue)) {
            // Process array type.
            if (currentNodeValue.length === 0) {
                htmlSegments.push(`<div class="empty-list-container lvl-${currentNestingLevel}">${settings.emptyArrayText}</div>`);
            } else {
                htmlSegments.push(`
                    <div class="${settings.listContainerClass} lvl-${currentNestingLevel} ${collapseExpandClass}" style="${visibilityStyle}">
                        <ol class="list-of-items" title="List with ${currentNodeValue.length} entries">
                `);
                currentNodeValue.forEach(dataItem => {
                    const itemHtml = processDataToHtml(dataItem, currentNestingLevel + 1, settings);
                    // Check if the item is a complex type (object or array) to determine if a toggle button is needed.
                    const needsToggle = (typeof dataItem === 'object' && dataItem !== null);
                    htmlSegments.push(`
                        <li class="${settings.listItemClass}">
                            ${needsToggle ? generateToggleButton(shouldBeCollapsed) : ''}
                            ${itemHtml}
                        </li>
                    `);
                });
                htmlSegments.push(`</ol></div>`);
            }
        } else if (typeof currentNodeValue === 'object') {
            // Process object type.
            const keys = Object.keys(currentNodeValue);
            if (keys.length === 0) {
                htmlSegments.push(`<div class="empty-map-container lvl-${currentNestingLevel}">${settings.emptyObjectText}</div>`);
            } else {
                htmlSegments.push(`
                    <div class="${settings.mapContainerClass} lvl-${currentNestingLevel} ${collapseExpandClass}" style="${visibilityStyle}">
                        <ul class="map-property-list">
                `);
                keys.forEach(keyName => {
                    const propertyValueHtml = processDataToHtml(currentNodeValue[keyName], currentNestingLevel + 1, settings);
                    // Check if the property value is a complex type (object or array) for a toggle button.
                    const needsToggle = (typeof currentNodeValue[keyName] === 'object' && currentNodeValue[keyName] !== null);
                    htmlSegments.push(`
                        <li class="${settings.mapPropertyClass}">
                            <dl class="property-definition-block">
                                <dt class="${settings.keyLabelClass}">
                                    ${keyName}:
                                    ${needsToggle ? generateToggleButton(shouldBeCollapsed) : ''}
                                </dt>
                                <dd class="${settings.valueContentClass}">
                                    ${propertyValueHtml}
                                </dd>
                            </dl>
                        </li>
                    `);
                });
                htmlSegments.push(`</ul></div>`);
            }
        } else {
            // Fallback for any other unexpected or unhandled types (e.g., Symbol, Function, undefined).
            console.warn('JsonDataTree: Encountered an unhandled data type:', typeof currentNodeValue, currentNodeValue);
            htmlSegments.push(`<p class="${settings.unhandledTypeClass}">Unhandled Type: ${String(currentNodeValue)}</p>`);
        }

        return htmlSegments.join('');
    }

    /**
     * Centralized function to handle the toggling of tree nodes (arrays/objects).
     * This function determines the relevant container to show/hide and updates the button text.
     * @param {jQuery} $button - The jQuery object of the clicked toggle button.
     * @param {object} settings - The plugin's current configuration settings.
     */
    function toggleNodeVisibility($button, settings) {
        // Determine if the toggle button is for an object property or an array item.
        const isPropertyToggle = $button.closest(`.${settings.keyLabelClass}`).length > 0;
        let $contentContainer; // The div containing the nested list/map
        let $parentEntryWrapper; // The <li> or <dl> element that wraps the toggle button and its content

        if (isPropertyToggle) {
            // For object properties, the toggle button is inside <dt>, content is in <dd>.
            $parentEntryWrapper = $button.closest(`.${settings.mapPropertyClass}`);
            $contentContainer = $parentEntryWrapper.find(`> .property-definition-block > .${settings.valueContentClass} > div.${settings.mapContainerClass}, > .property-definition-block > .${settings.valueContentClass} > div.${settings.listContainerClass}`);
        } else {
            // For array items, the toggle button is a direct child of <li>, content is next to it.
            $parentEntryWrapper = $button.closest(`.${settings.listItemClass}`);
            $contentContainer = $parentEntryWrapper.children(`div.${settings.listContainerClass}, div.${settings.mapContainerClass}`);
        }

        // If no content container is found (e.g., a toggle button erroneously placed next to a primitive value),
        // hide the button and exit.
        if (!$contentContainer.length) {
            $button.hide();
            return;
        }

        // Toggle visibility and update button text and parent class.
        if ($contentContainer.is(':visible')) {
            $button.text('[+]');
            $contentContainer.hide();
            $parentEntryWrapper.addClass(settings.collapsedClass).removeClass(settings.expandedClass);
        } else {
            $button.text('[-]');
            $contentContainer.show();
            $parentEntryWrapper.removeClass(settings.collapsedClass).addClass(settings.expandedClass);
        }
    }

    // Event delegation for toggle buttons.
    // We attach a single click handler to the document body, which will catch clicks
    // on any element matching `.${defaultSettings.toggleButtonClass}`, even those added dynamically.
    $(document).on('click', `.${defaultSettings.toggleButtonClass}`, function(eventObject) {
        eventObject.preventDefault(); // Prevent default link behavior (e.g., page jump).
        eventObject.stopPropagation(); // Stop event bubbling to prevent unintended parent element interactions.

        // Call the centralized toggle function using the clicked button and default settings.
        // Note: If different instances of the plugin used different settings for classes,
        // a more complex mechanism would be needed to retrieve the correct settings here.
        // For simplicity, we assume `toggleButtonClass` is consistent or use default.
        toggleNodeVisibility($(this), defaultSettings);
    });

    // Initial state synchronization for toggle buttons after rendering.
    // This ensures that if the HTML was generated with a collapsed state, the button text reflects it.
    // This is primarily a safeguard, as the HTML generation itself now handles initial display state.
    $(document).ready(function() {
        $(`.${defaultSettings.rootContainerClass} .${defaultSettings.toggleButtonClass}`).each(function() {
            const $btn = $(this);
            const initialState = $btn.data('initial-state');
            // If the button was rendered with an initial collapsed state, ensure its text is '[+]'.
            if (initialState === 'collapsed') {
                $btn.text('[+]');
            } else {
                // Otherwise (expanded state), ensure its text is '[-]'.
                $btn.text('[-]');
            }
        });
    });

})(jQuery); // Pass jQuery to the immediately invoked function expression to avoid global variable issues