(function(docNavBuilder) {

    // Modern JavaScript: Use strict mode for better error handling and security.
    "use strict";

    // Pass essential global objects (jQuery, window, document) to the main plugin logic.
    // This improves performance by reducing scope lookups and aids minification.
    docNavBuilder(window.jQuery, window, document);

}

// Self-executing anonymous function that encapsulates the plugin logic.
// It receives global objects as local parameters for optimized access.
(function($, win, doc, noVal) { // Renamed jQuery to $, window to win, document to doc, undefined to noVal

    // Enforce strict parsing and execution rules for the entire script.
    "use strict";

    // Core CSS class definitions for the navigation tree elements.
    const navRootClass = "doc-nav-tree", // Renamed tocClassName
          navRootSelector = "." + navRootClass,
          activeItemClass = "nav-active-focus", // Renamed tocFocusClassName
          hoverItemClass = "nav-item-hover", // Renamed tocHoverClassName
          hiddenTreeClass = "doc-nav-hidden", // Renamed hideTocClassName
          hiddenTreeSelector = "." + hiddenTreeClass,
          mainHeaderClass = "nav-main-heading", // Renamed headerClassName
          mainHeaderSelector = "." + mainHeaderClass,
          subHeaderClass = "nav-sub-heading", // Renamed subheaderClassName
          subHeaderSelector = "." + subHeaderClass,
          entryItemClass = "nav-tree-item", // Renamed itemClassName
          entryItemSelector = "." + entryItemClass,
          pageExtensionClass = "doc-nav-page-extend", // Renamed extendPageClassName
          pageExtensionSelector = "." + pageExtensionClass;

    // Utilize jQuery UI's widget factory for structured plugin development.
    $.widget("doc.navTree", { // Renamed "toc.tocify" to "doc.navTree"

        // Plugin version identifier.
        version: "2.1.0", // Updated version

        // Default configuration options for the navigation tree.
        options: {

            // **scopeElement**: String (jQuery selector)
            // The primary container holding all targetable heading elements.
            scopeElement: "article", // Renamed context to scopeElement, changed default

            // **exclusionFilter**: String (jQuery selector) or null
            // Elements matching this selector will be skipped during navigation tree generation.
            exclusionFilter: ".no-nav-entry", // Renamed ignoreSelector, added default exclusion

            // **headerTargets**: Array of Strings (jQuery selectors)
            // Defines the hierarchy of headings to include (e.g., ["h1", "h2", "h3"]).
            // Order is crucial for correct nesting.
            headerTargets: ["h1", "h2", "h3", "h4"], // Renamed selectors, expanded defaults

            // **toggleVisibility**: Boolean
            // If true, nested navigation items will expand/collapse.
            toggleVisibility: true, // Renamed showAndHide

            // **expandEffect**: String ("none", "fadeIn", "slideDown") or custom function
            // Animation effect for displaying hidden navigation items.
            expandEffect: "slideDown", // Renamed showEffect

            // **expandSpeed**: Number (milliseconds) or String ("slow", "normal", "fast")
            // Duration of the expansion animation.
            expandSpeed: 300, // Renamed showEffectSpeed, changed default

            // **collapseEffect**: String ("none", "fadeOut", "slideUp") or custom function
            // Animation effect for hiding visible navigation items.
            collapseEffect: "slideUp", // Renamed hideEffect

            // **collapseSpeed**: Number (milliseconds) or String ("slow", "normal", "fast")
            // Duration of the collapse animation.
            collapseSpeed: 300, // Renamed hideEffectSpeed, changed default

            // **smoothScrollToTarget**: Boolean
            // Enables smooth animated scrolling to the target content section.
            smoothScrollToTarget: true, // Renamed smoothScroll

            // **scrollAnimationDuration**: Number (milliseconds)
            // The time taken for the smooth scroll animation.
            scrollAnimationDuration: 600, // Renamed smoothScrollSpeed, changed default

            // **scrollOffset**: Number (pixels)
            // Vertical offset from the top of the viewport when scrolling to a target.
            scrollOffset: 10, // Renamed scrollTo, changed default

            // **dynamicToggleOnScroll**: Boolean
            // If true, navigation items will expand/collapse automatically based on scroll position.
            dynamicToggleOnScroll: true, // Renamed showAndHideOnScroll

            // **highlightOnViewport**: Boolean
            // Activates/deactivates navigation items as their corresponding content enters/leaves the viewport.
            highlightOnViewport: true, // Renamed highlightOnScroll

            // **highlightThreshold**: Number (pixels)
            // Distance from the top of the viewport to trigger the next active navigation item.
            highlightThreshold: 50, // Renamed highlightOffset, changed default

            // **stylingTheme**: String ("bootstrap", "jqueryui", "none")
            // Applies predefined CSS classes for styling (e.g., Bootstrap, jQuery UI).
            stylingTheme: "default", // Renamed theme, changed default

            // **autoExtendPage**: Boolean
            // If the last heading is not scrollable to, the page height is extended.
            autoExtendPage: true, // Renamed extendPage

            // **pageExtensionBuffer**: Number (pixels)
            // How close to the bottom the user must scroll before the page is extended.
            pageExtensionBuffer: 150, // Renamed extendPageOffset, changed default

            // **urlHistory**: Boolean
            // Updates the browser's URL hash to reflect the active navigation item.
            urlHistory: true, // Renamed history

            // **scrollHistory**: Boolean
            // Updates URL hash when scrolling to an item, not just on click.
            scrollHistory: false, // Renamed scrollHistory

            // **idGenerator**: String ("compact", "pretty") or Function(text, element)
            // Strategy for generating unique anchor IDs for content headings.
            // "compact": #CompressesAllTextTogether
            // "pretty": #looks-like-a-nice-url-and-is-easily-readable
            // Function: Custom ID generation logic.
            idGenerator: "pretty", // Renamed hashGenerator, changed default

            // **activateFirstOnLoad**: Boolean
            // If no hash is present on page load, the first item is highlighted.
            activateFirstOnLoad: true, // Renamed highlightDefault

            // **minHeadingsForTree**: Number
            // Minimum number of headings required to display the navigation tree.
            minHeadingsForTree: 2 // New option
        },

        // _initializeComponent
        // --------------------
        //      Sets up the navigation tree plugin. Executed once on creation.
        _initializeComponent: function() {
            console.log("Document Navigator: Initializing component...");

            const ctx = this; // Use 'ctx' for consistency, renamed 'self'
            if (!ctx.element.length) {
                console.warn("Document Navigator: Target element not found.");
                return; // Guard clause
            }

            ctx.pageExtensionActive = false; // Renamed extendPageScroll
            ctx.processedHeadings = []; // Renamed items (internal array for tracking processed headings)
            ctx.headingCoordinates = []; // Renamed cachedHeights
            ctx.anchorReferences = []; // Renamed cachedAnchors

            // Build the navigation tree structure.
            ctx._buildNavigationTree();

            // If the tree is empty or hidden, no further setup is needed.
            if (ctx.element.hasClass(hiddenTreeClass)) {
                return;
            }

            // Apply necessary CSS classes for styling.
            ctx._applyStylingClasses();

            // Attach all required event listeners.
            ctx._attachEventListeners();

            // Perform initial highlighting and state adjustments after the page has fully loaded.
            $(win).on("load.docnav", function() { // Use namespaced event
                ctx._updateActiveHighlight(true); // 'true' indicates initial page load

                // Deactivate page extension scroll after initial load to prevent immediate extension.
                // Using requestAnimationFrame for better performance than setTimeout(0).
                win.requestAnimationFrame(() => {
                    ctx.pageExtensionActive = false;
                });
            });
        },

        // _buildNavigationTree
        // --------------------
        //      Constructs the HTML structure for the dynamic navigation tree.
        _buildNavigationTree: function() {
            const ctx = this;
            let topLevelElements;
            let currentList;
            const exclusionFilter = ctx.options.exclusionFilter;
            const targetSelectors = ctx.options.headerTargets;

            // Determine the primary selector for top-level headings.
            if (Array.isArray(targetSelectors) && targetSelectors.length > 0) {
                const firstSelector = targetSelectors[0].trim();
                topLevelElements = $(ctx.options.scopeElement).find(firstSelector);
            } else {
                console.warn("Document Navigator: No valid header targets specified. Using default h1.");
                topLevelElements = $(ctx.options.scopeElement).find("h1");
            }

            // If no relevant headings are found, hide the navigation tree.
            if (topLevelElements.length < ctx.options.minHeadingsForTree) { // Use new option
                ctx.element.addClass(hiddenTreeClass);
                return;
            }

            // Apply the base class to the navigation container.
            ctx.element.addClass(navRootClass);

            // Iterate through each top-level heading to build the navigation structure.
            topLevelElements.each(function(idx) {
                const currentHeading = $(this);

                // Skip if the heading matches the exclusion filter.
                if (currentHeading.is(exclusionFilter)) {
                    return; // Continue to the next heading
                }

                // Create a new unordered list for this top-level section.
                currentList = $("<ul/>", {
                    "id": mainHeaderClass + "-" + idx, // Unique ID for the main header list
                    "class": mainHeaderClass // Apply the main header class
                });

                // Append the nested list item for the current heading.
                currentList.append(ctx._createNestedListItem(currentHeading, idx, 1)); // Pass current level

                // Find all subsequent headings until the next top-level heading.
                currentHeading.nextUntil(currentHeading.prop("nodeName").toLowerCase()).each(function() {
                    const siblingElement = $(this);

                    // Process subheadings, regardless of whether they are direct children or deeply nested.
                    siblingElement.find(targetSelectors.join(', ')).addBack(targetSelectors.join(', ')).each(function() {
                        const subHeading = $(this);

                        // Skip if the subheading matches the exclusion filter.
                        if (subHeading.is(exclusionFilter)) {
                            return;
                        }

                        ctx._processSubheadings.call(subHeading, ctx, currentList);
                    });
                });

                // Add the completed section's list to the main navigation tree.
                ctx.element.append(currentList);
            });
        },

        // _updateActiveHighlight
        // ----------------------
        //      Manages which navigation item is currently highlighted based on URL hash or scroll position.
        _updateActiveHighlight: function(isInitialLoad) { // Renamed pageload to isInitialLoad
            const ctx = this;
            const urlFragment = win.location.hash.substring(1); // Renamed hash to urlFragment
            let matchingItem = ctx.element.find("li[data-nav-id='" + urlFragment + "']"); // Renamed data-unique to data-nav-id

            // Remove previous highlights.
            ctx.element.find("." + activeItemClass).removeClass(activeItemClass);

            if (urlFragment.length && matchingItem.length) {
                // Highlight the item corresponding to the URL hash.
                matchingItem.addClass(activeItemClass);

                // If dynamic toggling is enabled, trigger a click to expand/collapse.
                if (ctx.options.toggleVisibility) {
                    matchingItem.trigger("click.docnav"); // Use namespaced event
                }
            } else if (isInitialLoad && ctx.options.activateFirstOnLoad) {
                // If no hash and it's the initial load, highlight the very first item.
                ctx.element.find(entryItemSelector).first().addClass(activeItemClass);
            }

            return ctx;
        },

        // _createNestedListItem
        // ---------------------
        //      Generates a list item for a given heading and its corresponding anchor.
        _createNestedListItem: function(headingElement, itemIndex, level) { // Renamed self to headingElement, index to itemIndex, added level
            const ctx = this;
            let duplicateCheck;
            let listItemNode;
            let anchorID;

            // Check for duplicate heading text to ensure unique IDs.
            duplicateCheck = ctx.processedHeadings.filter(itemText => itemText === headingElement.text());

            // Add the heading's text to the internal tracking array.
            if (duplicateCheck.length) {
                ctx.processedHeadings.push(headingElement.text() + itemIndex);
            } else {
                ctx.processedHeadings.push(headingElement.text());
            }

            // Generate a unique anchor ID for this heading.
            anchorID = ctx._createUniqueAnchorID(duplicateCheck.length > 0, headingElement, itemIndex);

            // ADDED: Actually assign the generated ID to the heading element itself.
            headingElement.attr("id", anchorID); // Assign ID directly to the heading

            // Create the list item element.
            listItemNode = $("<li/>", {
                "class": entryItemClass, // Standard class for all navigation items
                "data-nav-id": anchorID, // Store the unique ID as data attribute
                "data-nav-level": level // Store the heading level
            }).append($("<a/>", {
                "href": "#" + anchorID, // Link to the generated anchor
                "text": headingElement.text() // Display the heading's text
            }));

            // Insert a dummy anchor div before the heading element.
            // This div will be the actual scroll target.
            headingElement.before($("<div/>", {
                "class": "doc-nav-anchor-point", // Custom class for anchor points
                "data-nav-target": anchorID // Link to the generated anchor
            }));

            return listItemNode;
        },

        // _sanitizeText
        // -------------
        //      Helper to clean up text for use in IDs.
        _sanitizeText: function(text) {
            let sanitized = text.toLowerCase();
            // Remove non-ASCII characters
            sanitized = sanitized.replace(/[^\x00-\x7F]/g, "");
            // Replace various punctuation and spaces with hyphens
            sanitized = sanitized.replace(/[\s\W]+/g, "-");
            // Remove leading/trailing hyphens
            sanitized = sanitized.replace(/^-+|-+$/g, "");
            return sanitized;
        },

        // _createUniqueAnchorID
        // ---------------------
        //      Generates a unique and user-friendly ID for each heading.
        _createUniqueAnchorID: function(hasDuplicates, headingElement, itemIndex) { // Renamed arr to hasDuplicates, self to headingElement, index to itemIndex
            let generatedID = ""; // Renamed hashValue to generatedID
            const idGenerationStrategy = this.options.idGenerator; // Renamed hashGeneratorOption

            if (idGenerationStrategy === "pretty") {
                generatedID = this._sanitizeText(headingElement.text());
            } else if (typeof idGenerationStrategy === "function") {
                // Call the custom ID generation function provided in options.
                generatedID = idGenerationStrategy(headingElement.text(), headingElement);
            } else {
                // Default "compact" strategy: remove all spaces.
                generatedID = headingElement.text().replace(/\s/g, "");
            }

            // Ensure uniqueness by appending the index if duplicates were found.
            if (hasDuplicates) {
                generatedID = `${generatedID}-${itemIndex}`; // Using template literal
            }

            // Ensure the ID starts with a letter (HTML5 requirement for IDs).
            if (!/^[a-zA-Z]/.test(generatedID)) {
                generatedID = "section-" + generatedID;
            }

            return generatedID;
        },

        // _processSubheadings
        // -------------------
        //      Recursively appends subheadings to the appropriate parent list.
        _processSubheadings: function(ctx, parentList) { // Renamed self to ctx, ul to parentList
            const currentHeading = $(this); // 'this' refers to the subheading element
            const currentIndex = currentHeading.index(ctx.options.headerTargets.join(', '));
            const priorHeading = $(ctx.options.headerTargets.join(', ')).eq(currentIndex - 1);

            const currentLevel = +currentHeading.prop("tagName").charAt(1);
            const priorLevel = priorHeading.length ? +priorHeading.prop("tagName").charAt(1) : 0; // Handle first heading case

            // Find the most appropriate parent list to append to.
            let targetList = parentList;

            if (currentLevel > priorLevel) {
                // Current heading is a child of the previous one (e.g., h2 after h1).
                // Create a new nested UL and append to the previous LI.
                const lastSiblingItem = parentList.find(entryItemSelector).last();
                if (lastSiblingItem.length) {
                    const newSublist = $("<ul/>", { "class": subHeaderClass });
                    lastSiblingItem.append(newSublist);
                    targetList = newSublist;
                }
            } else if (currentLevel < priorLevel) {
                // Current heading is an ancestor of the previous one (e.g., h1 after h2).
                // Traverse up the tree to find the correct parent UL.
                let levelDifference = priorLevel - currentLevel;
                while (levelDifference > 0 && targetList.parent().is(entryItemSelector)) {
                    targetList = targetList.parent().parent('ul');
                    levelDifference--;
                }
                // Ensure we don't go above the main list
                if (!targetList.is(mainHeaderSelector) && targetList.length === 0) {
                    targetList = parentList; // Fallback to original parent
                }
            }
            // If currentLevel === priorLevel, targetList remains the same (sibling).

            // Append the new list item to the determined target list.
            targetList.append(ctx._createNestedListItem(currentHeading, currentIndex, currentLevel));
        },

        // _applyStylingClasses
        // --------------------
        // Applies theme-specific CSS classes to the navigation elements.
        _applyStylingClasses: function() {
            const ctx = this;
            const theme = ctx.options.stylingTheme;

            // Add base classes.
            ctx.element.addClass(navRootClass);
            ctx.element.find(entryItemSelector).addClass("nav-item");

            // Apply theme-specific classes.
            switch (theme) {
                case "bootstrap":
                    ctx.element.addClass("nav nav-list");
                    ctx.element.find(entryItemSelector).addClass("list-group-item");
                    ctx.element.find("a").addClass("text-secondary");
                    break;
                case "jqueryui":
                    ctx.element.addClass("ui-widget ui-widget-content");
                    ctx.element.find(entryItemSelector).addClass("ui-state-default");
                    ctx.element.find("a").addClass("ui-state-highlight");
                    break;
                case "default": // New default theme
                    ctx.element.addClass("docnav-default-theme");
                    ctx.element.find(entryItemSelector).addClass("docnav-item-default");
                    ctx.element.find("a").addClass("docnav-link-default");
                    break;
                case "none":
                    // No additional classes for 'none' theme.
                    break;
                default:
                    console.warn(`Document Navigator: Unknown theme '${theme}'. No theme-specific classes applied.`);
            }
        },

        // _attachEventListeners
        // ---------------------
        // Binds all necessary event handlers for user interaction and scrolling.
        _attachEventListeners: function() {
            const ctx = this;

            // Handle click events on navigation items.
            ctx.element.on("click.docnav", entryItemSelector + " > a", function(event) {
                event.preventDefault();
                const clickedLink = $(this);
                const targetID = clickedLink.attr("href").substring(1);
                const targetElement = $(`[data-nav-target='${targetID}']`);

                // Update URL hash if history is enabled.
                if (ctx.options.urlHistory) {
                    if (history.pushState) {
                        history.pushState(null, null, "#" + targetID);
                    } else {
                        win.location.hash = targetID;
                    }
                }

                // Smooth scroll to the target element.
                if (ctx.options.smoothScrollToTarget) {
                    $("html, body").animate({
                        scrollTop: targetElement.offset().top - ctx.options.scrollOffset
                    }, ctx.options.scrollAnimationDuration);
                } else {
                    win.scrollTo(0, targetElement.offset().top - ctx.options.scrollOffset);
                }

                // Update active highlight and toggle visibility.
                ctx.element.find("." + activeItemClass).removeClass(activeItemClass);
                clickedLink.parent(entryItemSelector).addClass(activeItemClass);

                if (ctx.options.toggleVisibility) {
                    ctx._toggleNestedVisibility(clickedLink.parent(entryItemSelector));
                }
            });

            // Handle hover events for visual feedback.
            ctx.element.on({
                "mouseenter.docnav": function() { $(this).addClass(hoverItemClass); },
                "mouseleave.docnav": function() { $(this).removeClass(hoverItemClass); }
            }, entryItemSelector);

            // Bind scroll event handler if highlightOnViewport or dynamicToggleOnScroll is enabled.
            if (ctx.options.highlightOnViewport || ctx.options.dynamicToggleOnScroll) {
                $(win).on("scroll.docnav resize.docnav", function() {
                    ctx._handleScrollAndResize();
                });
            }
        },

        // _toggleNestedVisibility
        // -----------------------
        // Shows or hides nested navigation items.
        _toggleNestedVisibility: function(parentItem) {
            const ctx = this;
            const nestedList = parentItem.children("ul");

            if (nestedList.length) {
                if (nestedList.is(":visible")) {
                    nestedList[ctx.options.collapseEffect](ctx.options.collapseSpeed);
                } else {
                    nestedList[ctx.options.expandEffect](ctx.options.expandSpeed);
                }
            }
        },

        // _handleScrollAndResize
        // ----------------------
        // Processes scroll and resize events to update the navigation tree state.
        _handleScrollAndResize: function() {
            const ctx = this;
            const currentScrollTop = $(win).scrollTop();
            let activeTargetID = "";

            // Recalculate header positions on resize or if not yet cached.
            if (ctx.headingCoordinates.length === 0 || $(win).data("docnav-resized")) {
                ctx.headingCoordinates = [];
                ctx.anchorReferences = [];
                $(ctx.options.scopeElement).find(ctx.options.headerTargets.join(', ')).each(function() {
                    const heading = $(this);
                    const anchorPoint = $(`[data-nav-target='${heading.attr('id')}']`);
                    if (anchorPoint.length) {
                        ctx.headingCoordinates.push(anchorPoint.offset().top);
                        ctx.anchorReferences.push(heading.attr('id'));
                    }
                });
                $(win).data("docnav-resized", false); // Reset resize flag
            }

            // Determine the currently active navigation item based on scroll position.
            for (let i = ctx.headingCoordinates.length - 1; i >= 0; i--) {
                if (currentScrollTop >= ctx.headingCoordinates[i] - ctx.options.highlightThreshold) {
                    activeTargetID = ctx.anchorReferences[i];
                    break;
                }
            }

            // Apply highlighting.
            if (ctx.options.highlightOnViewport && activeTargetID) {
                const currentActiveItem = ctx.element.find(`li[data-nav-id='${activeTargetID}']`);
                if (!currentActiveItem.hasClass(activeItemClass)) {
                    ctx.element.find("." + activeItemClass).removeClass(activeItemClass);
                    currentActiveItem.addClass(activeItemClass);

                    // If scroll history is enabled, update the URL hash.
                    if (ctx.options.scrollHistory) {
                         if (history.replaceState) {
                            history.replaceState(null, null, "#" + activeTargetID);
                        } else {
                            win.location.hash = activeTargetID;
                        }
                    }
                }
            }

            // Handle dynamic toggle on scroll.
            if (ctx.options.dynamicToggleOnScroll) {
                ctx.element.find(entryItemSelector).each(function() {
                    const navItem = $(this);
                    const targetID = navItem.data('nav-id');
                    const targetElement = $(`[data-nav-target='${targetID}']`);

                    if (targetElement.length) {
                        const targetTop = targetElement.offset().top;
                        const targetBottom = targetTop + targetElement.outerHeight();

                        // Check if the target element is currently in view.
                        if (currentScrollTop >= targetTop - ctx.options.highlightThreshold &&
                            currentScrollTop < targetBottom) {
                            if (navItem.children("ul").length && !navItem.children("ul").is(":visible")) {
                                navItem.children("ul")[ctx.options.expandEffect](ctx.options.expandSpeed);
                            }
                        } else {
                            if (navItem.children("ul").length && navItem.children("ul").is(":visible")) {
                                navItem.children("ul")[ctx.options.collapseEffect](ctx.options.collapseSpeed);
                            }
                        }
                    }
                });
            }

            // Handle page extension if enabled.
            if (ctx.options.autoExtendPage && !ctx.pageExtensionActive) {
                const docHeight = $(doc).height();
                const winHeight = $(win).height();
                if (currentScrollTop + winHeight >= docHeight - ctx.options.pageExtensionBuffer) {
                    ctx.pageExtensionActive = true;
                    $("body").append($("<div/>", { "class": pageExtensionClass, "height": winHeight }));
                }
            }
        },

        // _destroy
        // --------
        // Cleans up the plugin instance, removing generated elements and event listeners.
        _destroy: function() {
            console.log("Document Navigator: Destroying component...");
            const ctx = this;

            // Remove all namespaced event listeners.
            ctx.element.off(".docnav");
            $(win).off(".docnav");

            // Remove dynamically added classes.
            ctx.element.removeClass(navRootClass + " " + hiddenTreeClass + " docnav-default-theme");
            ctx.element.find(entryItemSelector).removeClass("nav-item " + activeItemClass + " " + hoverItemClass + " docnav-item-default");
            ctx.element.find("a").removeClass("docnav-link-default");

            // Remove theme-specific classes if they were applied.
            if (ctx.options.stylingTheme === "bootstrap") {
                ctx.element.removeClass("nav nav-list");
                ctx.element.find(entryItemSelector).removeClass("list-group-item");
                ctx.element.find("a").removeClass("text-secondary");
            } else if (ctx.options.stylingTheme === "jqueryui") {
                ctx.element.removeClass("ui-widget ui-widget-content");
                ctx.element.find(entryItemSelector).removeClass("ui-state-default");
                ctx.element.find("a").removeClass("ui-state-highlight");
            }

            // Remove the generated navigation HTML.
            ctx.element.empty();

            // Remove added anchor points in the content.
            $(ctx.options.scopeElement).find(".doc-nav-anchor-point").remove();

            // Remove page extension div.
            $("body").find("." + pageExtensionClass).remove();

            // Call the base widget destroy method.
            $.Widget.prototype.destroy.call(ctx);
        }
    });

})(jQuery, window, document);