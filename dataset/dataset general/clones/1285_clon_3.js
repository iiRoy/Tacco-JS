/*
 * jq.mobileNavAdapter
 *
 * This plugin dynamically converts standard HTML navigation lists (<ul>/<li>)
 * into a responsive <select> dropdown for mobile devices.
 *
 * Original concept by Jeremy Worboys.
 * License: MIT (or similar, avoiding the ☺ Licence for broader compatibility)
 * http://opensource.org/licenses/MIT
 */

;(function(jq, void_value) {

    // Define the plugin method on jQuery's prototype
    jq.fn.initMobileNavigation = function(initialConfig = {}) {

        // Core configuration settings for the adaptive navigation component.
        // Using `jq.extend(true, ...)` for a deep merge to ensure robustness
        // with nested configuration objects, though not strictly needed here.
        const componentSettings = jq.extend(true, {
            targetNavSelector:       "nav", // CSS selector to identify navigation blocks
            includeNestedNavs:       true,  // Flag to determine if nested navs should be processed

            enableWrapper:           true,  // Wrap the generated <select> in an additional element
            wrapperTagName:          "div", // HTML tag for the wrapper element (e.g., "div", "section")
            wrapperCssClass:         "responsive-nav-container", // CSS class for the wrapper
            wrapperElementId:        "",    // ID for the wrapper element

            dropdownCssClass:        "mobile-navigation-select", // CSS class for the <select> dropdown
            dropdownElementId:       "",    // ID for the <select> dropdown
            dropdownNameAttribute:   "mobile-menu", // Name attribute for the <select> for form submission

            defaultOptionText:       "Select a page...", // Placeholder text for the default option
            defaultOptionValue:      "#", // Value for the placeholder option (often a dummy value)
            defaultOptionDisabled:   true, // If true, the placeholder option cannot be selected

            enableGroupHeaders:      true,  // Create <optgroup> elements for navigation blocks
            groupLabelAttribute:     "data-nav-label", // Data attribute on nav elements for optgroup labels
            groupOrderAttribute:     "data-nav-order"  // Data attribute on nav elements for sorting optgroups
        }, initialConfig);

        // Helper function to sort optgroups based on a custom data attribute.
        // This ensures the order of navigation groups is preserved or custom-defined.
        const sortNavGroups = (groupA, groupB) => {
            const orderA = parseInt(groupA.data(componentSettings.groupOrderAttribute), 10);
            const orderB = parseInt(groupB.data(componentSettings.groupOrderAttribute), 10);

            // Handle cases where data attributes might be missing or contain non-numeric values.
            // Invalid entries are pushed to the end or beginning based on comparison.
            const isOrderANaN = isNaN(orderA);
            const isOrderBNaN = isNaN(orderB);

            if (isOrderANaN && isOrderBNaN) {
                return 0; // Both are invalid/missing, maintain original relative order
            } else if (isOrderANaN) {
                return 1; // 'A' is invalid, 'B' is valid; 'B' comes before 'A'
            } else if (isOrderBNaN) {
                return -1; // 'B' is invalid, 'A' is valid; 'A' comes before 'B'
            } else {
                return orderA - orderB; // Standard numeric comparison for valid orders
            }
        };

        // Iterate over each selected DOM element in the jQuery collection (e.g., each header).
        return this.each(function() {
            const currentRootElement = jq(this);

            // Guard clause: Ensure the root element itself is valid and exists before proceeding.
            if (!currentRootElement.length) {
                console.warn("MobileNavAdapter: Root element not found or invalid. Skipping initialization.", this);
                return;
            }

            let navigationElements = currentRootElement.find(componentSettings.targetNavSelector);
            let collectedOptionGroups = []; // Array to hold either <option> elements or <optgroup> elements
            let generatedMobileDropdown;

            // Early exit if no navigation elements are found within the current root container.
            if (navigationElements.length === 0) {
                console.info("MobileNavAdapter: No navigation elements found using selector '%s' within:",
                    componentSettings.targetNavSelector, currentRootElement[0]);
                return;
            }

            // Adjust the grouping behavior dynamically if only a single navigation element is present.
            // This prevents an unnecessary <optgroup> when there's only one source of links.
            if (navigationElements.length === 1) {
                // Only override the default if the user hasn't explicitly set `enableGroupHeaders`.
                if (initialConfig.enableGroupHeaders === void_value) {
                    componentSettings.enableGroupHeaders = false;
                    console.debug("MobileNavAdapter: Only one navigation element found, disabling grouping by default.");
                }
            }

            // If `includeNestedNavs` is explicitly false, filter out child navigation elements.
            if (!componentSettings.includeNestedNavs) {
                navigationElements = navigationElements.filter(function() {
                    const currentNav = jq(this);
                    // A navigation element is considered nested if it has an ancestor that is also a navigation element.
                    return !currentNav.parents(componentSettings.targetNavSelector).length;
                });
                if (navigationElements.length === 0) {
                     console.info("MobileNavAdapter: All navigation elements were nested and filtered out. Nothing to process.");
                     return;
                }
            }

            // Process each identified navigation element to extract its links and structure them into options.
            navigationElements.each(function() {
                const singleNavigationBlock = jq(this);
                let extractedNavOptions = []; // Temporary array for options from the current nav block

                // Retrieve all anchor tags (links) within the current navigation block.
                singleNavigationBlock.find("a").each(function() {
                    const anchorLink = jq(this);
                    const linkHref = anchorLink.attr("href");
                    const linkText = anchorLink.text().trim(); // Trim text content for cleaner options

                    // Validate link: skip if href is missing or empty, or if text is empty.
                    if (!linkHref || linkHref.trim() === "" || linkText === "") {
                        console.warn("MobileNavAdapter: Skipping anchor with empty href or text:", anchorLink[0]);
                        return;
                    }

                    // Create a new <option> element for the dropdown.
                    const newOptionElement = jq("<option>")
                        .val(linkHref)
                        .text(linkText);

                    extractedNavOptions.push(newOptionElement);
                });

                // If no valid options were extracted from this navigation block, skip it.
                if (extractedNavOptions.length === 0) {
                    console.info("MobileNavAdapter: No valid links found in navigation block, skipping:", singleNavigationBlock[0]);
                    return;
                }

                // Apply grouping logic based on settings.
                if (componentSettings.enableGroupHeaders) {
                    const navGroupLabel = singleNavigationBlock.data(componentSettings.groupLabelAttribute);

                    // Only create an <optgroup> if a label is explicitly provided.
                    if (navGroupLabel) {
                        const currentOptionGroup = jq("<optgroup>")
                            .attr("label", navGroupLabel)
                            .data(componentSettings.groupOrderAttribute, singleNavigationBlock.data(componentSettings.groupOrderAttribute));

                        // Append all extracted options to this new optgroup.
                        jq.each(extractedNavOptions, function(idx, optNode) {
                            currentOptionGroup.append(optNode);
                        });

                        // Replace the individual options array with the single optgroup for collection.
                        extractedNavOptions = [currentOptionGroup];
                    } else {
                        console.warn("MobileNavAdapter: Grouping enabled but no label found for navigation block. Adding options directly:", singleNavigationBlock[0]);
                    }
                }

                // Add the processed options (or the single optgroup) to the main collection.
                // Using `push.apply` effectively flattens the array if `extractedNavOptions` contains multiple options,
                // or adds the single optgroup directly.
                collectedOptionGroups.push.apply(collectedOptionGroups, extractedNavOptions);
            });

            // Sort the collected optgroups if grouping is active and there's more than one group to sort.
            if (componentSettings.enableGroupHeaders && collectedOptionGroups.length > 1) {
                collectedOptionGroups.sort(sortNavGroups);
            }

            // Construct the main <select> dropdown element with appropriate attributes.
            generatedMobileDropdown = jq("<select>")
                .addClass(componentSettings.dropdownCssClass)
                .attr("id", componentSettings.dropdownElementId)
                .attr("name", componentSettings.dropdownNameAttribute)
                .attr("aria-label", componentSettings.defaultOptionText); // Accessibility improvement

            // Create and append the default placeholder option.
            const placeholderOption = jq("<option>")
                .text(componentSettings.defaultOptionText)
                .val(componentSettings.defaultOptionValue);

            if (componentSettings.defaultOptionDisabled) {
                placeholderOption.attr("disabled", "disabled");
            }
            // If the default value is a dummy placeholder like "#", make it initially selected.
            if (componentSettings.defaultOptionValue === "#") {
                 placeholderOption.attr("selected", "selected");
            }

            generatedMobileDropdown.append(placeholderOption);

            // Append all processed option groups (or individual options) to the dropdown.
            jq.each(collectedOptionGroups, function(index, groupOrOption) {
                generatedMobileDropdown.append(groupOrOption);
            });

            // Attach the change event handler for navigation.
            generatedMobileDropdown.on("change", function() {
                const selectedValue = jq(this).find(":selected").val();
                // Perform navigation only if a valid, non-placeholder value is selected.
                if (selectedValue && selectedValue !== componentSettings.defaultOptionValue) {
                    document.location.assign(selectedValue); // Use assign for clear navigation intent
                }
            });

            // Prepare the element that will ultimately be appended to the root container.
            let finalElementToAppend = generatedMobileDropdown;

            // Wrap the dropdown if the configuration requires it.
            if (componentSettings.enableWrapper) {
                const dropdownWrapper = jq("<" + componentSettings.wrapperTagName + ">")
                    .addClass(componentSettings.wrapperCssClass)
                    .attr("id", componentSettings.wrapperElementId);

                dropdownWrapper.append(generatedMobileDropdown);
                finalElementToAppend = dropdownWrapper; // Update the element to be appended
            }

            // Append the final dropdown (or its wrapper) to the root container.
            currentRootElement.append(finalElementToAppend);

            // Optional: Add a success class and data attribute to the root element for status tracking.
            currentRootElement.addClass("mobile-nav-initialized").data("mobileNavStatus", "active");
            console.log("MobileNavAdapter: Successfully initialized for element:", currentRootElement[0]);
        });

    };

}(window.jQuery, undefined));