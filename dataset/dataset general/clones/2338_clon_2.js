// = require ./jquery_ui_new
/* jscs-disable */
/* jshint ignore:start */
/* contentIndex - v1.8.0 - 2013-09-16
 * https://www.gregfranko.com/jquery.tocify.js/
 * Copyright (c) 2013 Greg Franko; Licensed under MIT
 * Slightly modified by R. Lord to correct a discovered defect,
 * and to automatically assign IDs to header elements
 * also for height caching, as repeated height lookups for H1s and H2s
 * caused significant performance dips below 30 frames per second */

// A self-executing anonymous function pattern (IIFE) as described by Ben Alman,
// which invokes another IIFE containing all core plugin logic.
// This structure enhances readability by keeping local parameters for the main IIFE
// visible without needing to scroll to the end of the file.
(function(contentIndexCreator) {
    // Enable ECMAScript 5 Strict Mode: [John Resig's Blog Post](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
    "use strict";

    // Invoke the nested IIFE, passing global jQuery, window, and document objects.
    contentIndexCreator(window.jQuery, window, document);
}

// Pass `jQuery`, `window`, `document`, and an `undefined` variable locally.
// Passing global objects locally enhances performance by allowing JavaScript to
// search within local variables first. All global variables are also passed locally
// to be compatible with minification. `undefined` is passed locally because it's
// not a reserved keyword in JavaScript, ensuring its true undefined state.
(function(jQ, globalWindow, pageDoc, undef) {
    // Enforce ECMAScript 5 Strict Mode: [John Resig's Blog Post](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
    "use strict";

    var indexContainerName = "content-index-container",
        indexContainerSel = "." + indexContainerName,
        indexActiveName = "content-index-active",
        indexHoverName = "content-index-hover",
        indexHideName = "content-index-hidden",
        indexHideSel = "." + indexHideName,
        mainHeadingName = "content-index-main-heading",
        mainHeadingSel = "." + mainHeadingName,
        subHeadingName = "content-index-sub-heading",
        subHeadingSel = "." + subHeadingName,
        entryItemName = "content-index-entry",
        entryItemSel = "." + entryItemName,
        expandViewName = "content-index-expand-page",
        expandViewSel = "." + expandViewName;

    // Utilize the jQueryUI Widget Factory Pattern
    jQ.widget("index.contentIndex", {

        // Plugin version identifier
        libVersion: "1.8.0",

        // Default configuration settings for the plugin
        options: {

            // **scopeElement**: String: Any jQuery selector
            // The enclosing element that contains all components used to construct the table of contents.
            scopeElement: "body",

            // **excludedSelector**: String: Any jQuery selector
            // A selector for any element that should be disregarded, even if it matches other selectors.
            excludedSelector: null,

            // **targetElements**: Array of Strings: Any jQuery selectors
            // The elements used to generate the table of contents. Their sequence is crucial
            // as it dictates the nested hierarchy of the table of contents.
            targetElements: "h1, h2, h3",

            // **toggleVisibility**: Boolean: true or false
            // Controls whether elements should be shown and hidden.
            toggleVisibility: true,

            // **displayEffect**: String: "none", "fadeIn", "show", or "slideDown"
            // The animation effect used to reveal any nested items in the table of contents.
            displayEffect: "slideDown",

            // **displaySpeed**: Number (milliseconds) or String: "slow", "medium", or "fast"
            // The duration of the display animation.
            displaySpeed: "medium",

            // **concealEffect**: String: "none", "fadeOut", "hide", or "slideUp"
            // The animation effect used to hide any nested items in the table of contents.
            concealEffect: "slideUp",

            // **concealSpeed**: Number (milliseconds) or String: "slow", "medium", or "fast"
            // The duration of the hide animation.
            concealSpeed: "medium",

            // **animatedScroll**: Boolean: true or false
            // Determines if a jQuery animation should be used for scrolling to specific table of contents items.
            animatedScroll: true,

            // **animatedScrollSpeed**: Number (milliseconds) or String: "slow", "medium", or "fast"
            // The duration of the animated scroll effect.
            animatedScrollSpeed: "medium",

            // **scrollOffset**: Number (pixels)
            // The vertical distance from the top of the page to the selected table of contents item after scrolling.
            scrollOffset: 0,

            // **toggleOnScroll**: Boolean: true or false
            // Controls whether nested table of contents items should be shown and hidden during page scrolling.
            toggleOnScroll: true,

            // **emphasizeOnScroll**: Boolean: true or false
            // Controls whether table of contents items should be highlighted (e.g., color change) during scrolling.
            emphasizeOnScroll: true,

            // **emphasisOffset**: Number
            // The pixel offset distance to trigger the next active table of contents item.
            emphasisOffset: 40,

            // **visualTheme**: String: "bootstrap", "jqueryui", or "none"
            // Specifies if Twitter Bootstrap, jQueryUI, or custom Tocify classes should be applied to the table of contents.
            visualTheme: "bootstrap",

            // **enlargePage**: Boolean: true or false
            // If the user scrolls to the bottom of the page and the page is not tall enough to reach the last
            // table of contents item, the page height is dynamically increased.
            enlargePage: true,

            // **enlargePageOffset**: Number: pixels
            // The proximity to the bottom of the page required before the page extension is triggered.
            enlargePageOffset: 100,

            // **urlHistory**: Boolean: true or false
            // Adds a hash to the page URL to maintain browser history.
            urlHistory: true,

            // **scrollUrlHistory**: Boolean: true or false
            // Adds a hash to the page URL, to maintain history, when scrolling to a TOC item.
            scrollUrlHistory: false,

            // **anchorCreator**: Determines how the anchor value (the segment of the URL after the #)
            // will be generated.
            //
            // "compact" (default) - #CompressesEverythingTogether
            // "pretty" - #looks-like-a-nice-url-and-is-easily-readable
            // function(text, element){} - A custom function that accepts the text as an
            // argument and returns the anchor value.
            anchorCreator: "compact",

            // **emphasizeInitial**: Boolean: true or false
            // Designates the first TOC item as active if no other TOC item is currently active.
            emphasizeInitial: true

        },

        // _initPlugin
        // -----------
        //      Initializes the plugin functionality. This method is executed only once.
        _initPlugin: function() {

            var pluginInstance = this;

            pluginInstance.indexWrapper = jQ('.tocify-wrapper');
            pluginInstance.pageExtensionActive = true;

            // An internal array to track all TOC entries, helping to identify duplicate entry strings.
            pluginInstance.indexEntries = [];

            // Generates the fundamental HTML structure for the dynamic table of contents.
            pluginInstance._buildIndexStructure();

            // Stores heights and anchors for performance.
            pluginInstance.storedHeights = [];
            pluginInstance.storedAnchors = [];

            // Applies relevant CSS classes to the newly generated table of contents HTML.
            pluginInstance._applyStylingClasses();

            pluginInstance.isWebKit = (function() {

                for(var propKey in globalWindow) {

                    if(propKey) {

                        if(propKey.toLowerCase().indexOf("webkit") !== -1) {

                            return true;

                        }

                    }

                }

                return false;

            }());

            // Attaches jQuery event handlers to the recently created table of contents.
            pluginInstance._attachEventHandlers();

            // Binds to the Window load event to ensure `scrollTop` is computed accurately.
            jQ(globalWindow).load(function() {

                // Sets the currently active TOC entry.
                pluginInstance._markActiveEntry(true);

                // Once all ongoing animations on the page are finished, this callback will be executed.
                jQ("html, body").promise().done(function() {

                    setTimeout(function() {

                        pluginInstance.pageExtensionActive = false;

                    },0);

                });

            });

        },

        // Placeholder for _addCSSClasses, as it was called but not defined in the snippet.
        _applyStylingClasses: function() {
            // Implementation for applying CSS classes would go here.
            // For example:
            // this.element.addClass(this.options.visualTheme);
            // this.element.find('ul').addClass(this.options.visualTheme + '-list');
            // etc.
        },

        // Placeholder for _setEventHandlers, as it was called but not defined in the snippet.
        _attachEventHandlers: function() {
            // Implementation for attaching event listeners would go here.
            // For example:
            // var pluginInstance = this;
            // this.element.on('click', entryItemSel, function(evt) {
            //     pluginInstance._handleClick(evt, jQ(this));
            // });
            // jQ(globalWindow).on('scroll', function() {
            //     pluginInstance._handleScroll();
            // });
        },

        // _buildIndexStructure
        // --------------------
        //      Constructs the HTML for the dynamic table of contents.
        _buildIndexStructure: function() {

            // _Local variables_

            // Stores the plugin's context in `pluginInstance`.
            var pluginInstance = this,

                // All HTML elements found within the specified `scopeElement` (e.g., body)
                // that match the primary jQuery selector.
                primaryElements,

                // An instantiated variable that will hold the newly created top-level unordered list DOM element.
                unorderedList,
                excludedContentSelector = pluginInstance.options.excludedSelector;

             // If the `targetElements` option string contains a comma (indicating multiple selectors).
             if(this.options.targetElements.indexOf(",") !== -1) {

                 // Extracts the first selector from the string.
                 primaryElements = jQ(this.options.scopeElement).find(this.options.targetElements.replace(/ /g,"").substr(0, this.options.targetElements.indexOf(",")));

             }

             // If the `targetElements` option string does not contain a comma.
             else {

                 // Grabs the single selector from the string, ensuring no spaces.
                 primaryElements = jQ(this.options.scopeElement).find(this.options.targetElements.replace(/ /g,""));

             }

            if(!primaryElements.length) {

                pluginInstance.element.addClass(indexHideName);

                return;

            }

            pluginInstance.element.addClass(indexContainerName);

            // Iterates through each primary-level selector element.
            primaryElements.each(function(elementIndex) {

                // If the current element matches the `excludedContentSelector`, it is skipped.
                if(jQ(this).is(excludedContentSelector)) {
                    return;
                }

                // Creates an unordered list HTML element, assigning a dynamic ID and a standard class name.
                unorderedList = jQ("<ul/>", {
                    "id": mainHeadingName + elementIndex,
                    "class": mainHeadingName
                }).

                // Appends a top-level list item HTML element to the previously created HTML heading.
                append(pluginInstance._insertNestedEntries(jQ(this), elementIndex));

                // Adds the generated unordered list element to the HTML element that invoked the plugin.
                pluginInstance.element.append(unorderedList);

                // Locates all HTML elements positioned between the current header and subsequent subheader elements.
                jQ(this).nextUntil(this.nodeName.toLowerCase()).each(function() {

                    // If there are no nested subheader elements within the current block.
                    if(jQ(this).find(pluginInstance.options.targetElements).length === 0) {

                        // Iterates through all subheader elements.
                        jQ(this).filter(pluginInstance.options.targetElements).each(function() {

                            // If the element matches the `excludedContentSelector`, it is skipped.
                            if(jQ(this).is(excludedContentSelector)) {
                                return;
                            }

                            pluginInstance._addSecondaryHeadings.call(this, pluginInstance, unorderedList);

                        });

                    }

                    // If there are nested subheader elements within the current block.
                    else {

                        // Iterates through all subheader elements found within.
                        jQ(this).find(pluginInstance.options.targetElements).each(function() {

                            // If the element matches the `excludedContentSelector`, it is skipped.
                            if(jQ(this).is(excludedContentSelector)) {
                                return;
                            }

                            pluginInstance._addSecondaryHeadings.call(this, pluginInstance, unorderedList);

                        });

                    }

                });

            });

        },

        _markActiveEntry: function(onInitialLoad) {

            var pluginInstance = this,

                urlAnchor = globalWindow.location.hash.substring(1),

                targetEntry = pluginInstance.element.find("li[data-unique='" + urlAnchor + "']");

            if(urlAnchor.length) {

                // Removes active highlighting from all list items.
                pluginInstance.element.find("." + pluginInstance.activeCssClass).removeClass(pluginInstance.activeCssClass);

                // Applies highlighting to the currently clicked list item.
                targetEntry.addClass(pluginInstance.activeCssClass);

                // If the `toggleVisibility` option is set to true.
                if(pluginInstance.options.toggleVisibility) {

                    // Triggers the click event on the currently focused TOC item.
                    targetEntry.click();

                }

            }

            else {

                // Removes active highlighting from all list items.
                pluginInstance.element.find("." + pluginInstance.activeCssClass).removeClass(pluginInstance.activeCssClass);

                if(!urlAnchor.length && onInitialLoad && pluginInstance.options.emphasizeInitial) {

                    // Highlights the very first TOC item if no other items are currently highlighted.
                    pluginInstance.element.find(entryItemSel).first().addClass(pluginInstance.activeCssClass);

                }

            }

            return pluginInstance;

        },

        // _insertNestedEntries
        // --------------------
        //      Assists in constructing the table of contents list by appending nested list items.
        _insertNestedEntries: function(targetElement, entryIndex) {

            var duplicateCheck, newListItem, generatedAnchor;

            duplicateCheck = jQ.grep(this.indexEntries, function (itemContent) {

                return itemContent === targetElement.text();

            });

            // If a duplicate TOC entry already exists.
            if(duplicateCheck.length) {

                // Adds the current TOC entry text and its index (for minor randomization) to the internal array.
                this.indexEntries.push(targetElement.text() + entryIndex);

            }

            // If there is no duplicate TOC entry.
            else {

                // Adds the current TOC entry text to the internal array.
                this.indexEntries.push(targetElement.text());

            }

            generatedAnchor = this._createAnchorValue(duplicateCheck, targetElement, entryIndex);

            // ADDED BY ROBERT
            // Explicitly assign the generated anchor value as the element's ID.
            // targetElement.attr("id", "link-" + generatedAnchor);

            // Appends a list item HTML element to the last unordered list HTML element found within
            // the HTML element that invoked the plugin.
            newListItem = jQ("<li/>", {

                // Assigns a consistent class name to the list item.
                "class": entryItemName,

                "data-unique": generatedAnchor

            }).append(jQ("<a/>", {

                "text": targetElement.text()

            }));

            // Inserts an HTML anchor tag immediately before the currently traversed HTML element.
            targetElement.before(jQ("<div/>", {

                // Sets a `name` attribute on the anchor tag using the text of the currently traversed
                // HTML element (ensuring all whitespace is replaced with an underscore).
                "name": generatedAnchor,

                "data-unique": generatedAnchor

            }));

            return newListItem;

        },

        // _createAnchorValue
        // ------------------
        //      Generates the anchor value that will be used to reference each item.
        _createAnchorValue: function(duplicateCheck, sourceElement, entryIndex) {

            var resultAnchor = "",
                anchorGenOption = this.options.anchorCreator;

            if (anchorGenOption === "pretty") {
                // remove problematic characters


                // format the text for readability
                resultAnchor = sourceElement.text().toLowerCase().replace(/\s/g, "-");

                // ADDED BY ROBERT
                // strip out non-ASCII characters
                resultAnchor = resultAnchor.replace(/[^\x00-\x7F]/g, "");

                // fix instances of double hyphens
                while (resultAnchor.indexOf("--") > -1) {
                    resultAnchor = resultAnchor.replace(/--/g, "-");
                }

                // fix colon-hyphen combinations
                while (resultAnchor.indexOf(":-") > -1) {
                    resultAnchor = resultAnchor.replace(/:-/g, "-");
                }

            } else if (typeof anchorGenOption === "function") {

                // invoke the custom function
                resultAnchor = anchorGenOption(sourceElement.text(), sourceElement);

            } else {

                // default to compact format
                resultAnchor = sourceElement.text().replace(/\s/g, "");

            }

            // append the index if duplicates were found
            if (duplicateCheck.length) { resultAnchor += ""+entryIndex; }

            // return the final anchor value
            return resultAnchor;

        },

        // _addSecondaryHeadings
        // ---------------------
        //      Assists in creating the table of contents list by appending subheader elements.

        _addSecondaryHeadings: function(pluginInstance, parentList) {

            // The zero-based index of the current element.
            var currentElemIndex = jQ(this).index(pluginInstance.options.targetElements),

                // Retrieves the DOM element for the preceding header.
                prevElement = jQ(pluginInstance.options.targetElements).eq(currentElemIndex - 1),

                currentTagLevel = +jQ(this).prop("tagName").charAt(1),

                prevTagLevel = +prevElement.prop("tagName").charAt(1),

                lastSubItem;

            // If the current header's DOM element level is numerically smaller than the previous header's,
            // or if it's the first subheader.
            if(currentTagLevel < prevTagLevel) {

                // Selects the last unordered list HTML element found within the plugin's calling element,
                // matching the `subHeadingSel` and `data-tag` attribute, then appends the nested element.
                pluginInstance.element.find(subHeadingSel + "[data-tag=" + currentTagLevel + "]").last().append(pluginInstance._insertNestedEntries(jQ(this), currentElemIndex));

            }

            // If the current header's DOM element level (e.g., H4) is identical to the previous header's.
            else if(currentTagLevel === prevTagLevel) {
/* jshint ignore:end */
/* jscs:enable */