// Hierarchical Content Browser component by bu <bu@hax4.in>, BSD License.
// This script enables a multi-column interface for navigating hierarchical data.

(function(jQuery) {

    // Base configuration for the browser instance.
    // User-provided options will extend these defaults.
    const baseConfiguration = {
        // Function to fetch data for a given node ID.
        // Expects a callback (error, dataArray).
        resourceProvider: function(nodeIdentifier, responseCallback) {
            // Placeholder: Developers must implement their own data fetching logic.
            // In a production scenario, this might throw an error or return an empty array.
            console.warn("Warning: No custom resourceProvider defined. Returning an error for dummy source.");
            responseCallback(new Error("A custom resourceProvider function must be implemented."), null);
        },

        // Message displayed when a column has no content.
        emptyContentMessage: "Nothing to display here.",
        // Placeholder text for the search input field.
        searchPromptText: "Filter items...",

        // Flag to enable or disable search functionality.
        isSearchEnabled: false,

        // Custom icons mapping for different node types.
        userDefinedTypeIcons: {},
        // Custom action handlers for different node types.
        userDefinedTypeActions: {}
    };

    // Default functions to handle various node types.
    // These define the behavior when a specific type of item is clicked.
    const standardActionHandlers = {
        // Handler for 'directory' type nodes.
        // Fetches child nodes and renders a new column.
        directory: function(browserInstance, clickedElement, resourceInfo) {
            browserInstance.config.resourceProvider(resourceInfo.id, function(errorPayload, fetchedData) {
                if (errorPayload) {
                    return console.error("Error fetching directory contents:", errorPayload);
                }
                // Ensure fetchedData is an array before processing.
                if (!Array.isArray(fetchedData)) {
                    console.error("Resource provider returned non-array data for directory:", fetchedData);
                    fetchedData = [];
                }
                // Render a new column with the fetched data.
                return browserInstance._renderContentList(fetchedData);
            });
        },

        // Handler for 'webLink' type nodes.
        // Opens the associated URL in a new window/tab.
        webLink: function(browserInstance, clickedElement, resourceInfo) {
            if (resourceInfo && resourceInfo.url) {
                // Using '_blank' to ensure it opens in a new tab/window.
                return window.open(resourceInfo.url, '_blank');
            }
            console.warn("Web link clicked but no valid URL found in resource information:", resourceInfo);
            return false;
        }
    };

    // Default icon classes for different node types.
    // Using Font Awesome 5 Free icons for better visual representation.
    const standardTypeIcons = {
        directory: "fas fa-folder",
        webLink: "fas fa-external-link-alt"
    };

    // Utility function for debouncing input events to improve performance.
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Collection of core operations and methods for the hierarchical browser.
    // These methods are designed to be bound to a specific instance of the browser.
    const componentOperations = {
        // Initializes the hierarchical browser on selected elements.
        initialize: function(userOptions) {
            // Deep merge default configuration with user-provided options to handle nested objects.
            const currentConfig = jQuery.extend(true, {}, baseConfiguration, userOptions);

            // Basic validation for critical configuration.
            if (typeof currentConfig.resourceProvider !== 'function') {
                console.error("Initialization failed: 'resourceProvider' must be a function.");
                return this; // Maintain chainability even on error.
            }

            // Merge default handlers and indicators with user-defined ones.
            const activeHandlers = jQuery.extend({}, standardActionHandlers, currentConfig.userDefinedTypeActions);
            const activeIcons = jQuery.extend({}, standardTypeIcons, currentConfig.userDefinedTypeIcons);

            // Iterate over each selected DOM element to apply the component logic.
            return this.each(function() {
                const containerElement = jQuery(this);
                let instanceData = containerElement.data("browserInstance");

                // Prevent re-initialization if the element already has instance data.
                if (instanceData) {
                    console.info("Hierarchical browser already initialized on this element.");
                    return;
                }

                // Store instance-specific configuration and bound methods.
                // Binding methods ensures 'this' context refers to the instance data.
                instanceData = {
                    config: currentConfig,
                    handlers: activeHandlers,
                    icons: activeIcons,
                    rootContainer: this, // Reference to the raw DOM element for direct access.
                    // Bound methods for easier access within the instance.
                    _renderContentList: componentOperations._renderContentList.bind(this),
                    _handleItemSelection: componentOperations._handleItemSelection.bind(this),
                    _appendSearchBox: componentOperations._appendSearchBox.bind(this),
                    _insertColumn: componentOperations._insertColumn.bind(this),
                    _clearSubsequentColumns: componentOperations._clearSubsequentColumns.bind(this)
                };

                // Store the instance data directly on the DOM element using jQuery's .data().
                containerElement.data("browserInstance", instanceData);

                // Add a base class for component-specific styling.
                containerElement.addClass("hierarchical-browser-wrapper");

                // Create the main composition area where columns will be added.
                jQuery("<div></div>")
                    .addClass("browser-column-composition")
                    .appendTo(containerElement);

                // Set up event delegation for interactive elements.
                componentOperations._setupEventDelegation(containerElement);

                // Perform the initial data load for the first column.
                instanceData.config.resourceProvider(null, function(errorPayload, initialData) {
                    if (errorPayload) {
                        return console.error("Initial data load failed:", errorPayload);
                    }
                    if (!Array.isArray(initialData)) {
                         console.error("Initial data must be an array. Received:", initialData);
                         initialData = []; // Default to empty array to prevent errors.
                    }
                    instanceData._renderContentList(initialData);
                });
            });
        },

        // Sets up event listeners using delegation on the container element.
        _setupEventDelegation: function(containerElement) {
            // Event listener for clicking on any list item, excluding the search input row.
            // Using a namespaced event 'click.hierarchicalBrowser' for easier unbinding if needed.
            containerElement.on("click.hierarchicalBrowser", ".browser-column > ul > li:not(.search-row)", function(event) {
                // The 'this' context here is the clicked list item.
                // The bound _handleItemSelection method will receive the root container as its first argument.
                const rootElement = jQuery(this).closest(".hierarchical-browser-wrapper")[0];
                const instanceData = jQuery(rootElement).data("browserInstance");
                if (instanceData) {
                    instanceData._handleItemSelection(this); // Pass the clicked DOM element.
                } else {
                    console.error("Instance data not found for clicked item's parent browser.");
                }
            });
            // Additional event listeners for other interactions can be added here.
        },

        // Handles the click event on a list item, managing column updates and actions.
        _handleItemSelection: function(clickedItemDom) {
            // 'this' is bound to the root container DOM element.
            const instanceData = jQuery(this).data("browserInstance");
            if (!instanceData) {
                console.error("Browser instance data not found for root element during item selection.");
                return;
            }

            const activeContainer = jQuery(this);
            const selectedColumn = jQuery(clickedItemDom).closest(".browser-column");
            const selectionLevel = selectedColumn.index(); // Get the 0-based index of the selected column.

            const selectedItemType = jQuery(clickedItemDom).data("item-type");
            const selectedItemDetails = jQuery(clickedItemDom).data("item-details");

            // Clear any columns that are to the right of the newly selected column.
            instanceData._clearSubsequentColumns(selectionLevel);

            // Update the 'active' state for styling: remove from siblings, add to the clicked item.
            selectedColumn.find(".active-item").removeClass("active-item");
            jQuery(clickedItemDom).addClass("active-item");

            // Guard clause: Check if a handler is defined for the selected item's type.
            if (!selectedItemType || !instanceData.handlers[selectedItemType]) {
                console.warn(`No specific handler defined for item type: '${selectedItemType}'. Item details:`, selectedItemDetails);
                // Optionally, could provide a default "no action" handler or display a message.
                return;
            }

            // Execute the appropriate handler function based on the item's type.
            return instanceData.handlers[selectedItemType](instanceData, clickedItemDom, selectedItemDetails);
        },

        // Renders a new column populated with a list of items.
        _renderContentList: function(itemList) {
            // 'this' is bound to the root container DOM element.
            const instanceData = jQuery(this).data("browserInstance");
            if (!instanceData) {
                console.error("Browser instance data not found for root element during rendering.");
                return;
            }

            const contentListElement = jQuery("<ul></ul>");

            // If the item list is empty or invalid, display a "no content" message.
            if (!itemList || !Array.isArray(itemList) || itemList.length === 0) {
                const emptyMessageElement = jQuery("<p></p>")
                    .addClass("empty-column-message")
                    .text(instanceData.config.emptyContentMessage);
                return instanceData._insertColumn(emptyMessageElement);
            }

            // If search functionality is enabled, add a search input row to the column.
            if (instanceData.config.isSearchEnabled) {
                instanceData._appendSearchBox(contentListElement);
            }

            // Iterate through the provided item list and create corresponding list items.
            itemList.forEach(item => {
                // Basic validation for each item's structure.
                if (!item || typeof item.id === 'undefined' || typeof item.type === 'undefined' || typeof item.label === 'undefined') {
                    console.warn("Skipping malformed or incomplete item data:", item);
                    return;
                }

                const listItemElement = jQuery("<li>")
                    .data("item-id", item.id)
                    .data("item-type", item.type)
                    .data("item-details", item) // Store full item data for handlers.
                    .attr('title', item.label); // Add a tooltip for accessibility.

                // Determine the icon class, falling back to a default if not found.
                const itemIconClass = instanceData.icons[item.type] || "fas fa-question-circle";
                const itemIconElement = jQuery("<i>")
                    .addClass(itemIconClass);

                // Construct the list item: icon followed by text.
                // Using .text() for the label automatically escapes HTML, preventing XSS.
                listItemElement
                    .append(itemIconElement)
                    .append(document.createTextNode(" " + item.label)); // Add a space for separation.

                contentListElement.append(listItemElement);
            });

            return instanceData._insertColumn(contentListElement);
        },

        // Appends a search input field to the specified list element within a column.
        _appendSearchBox: function(targetListElement) {
            // 'this' is bound to the root container DOM element.
            const instanceData = jQuery(this).data("browserInstance");
            if (!instanceData) {
                console.error("Browser instance data not found for root element during search box creation.");
                return;
            }

            const searchRow = jQuery('<li class="search-row"></li>');
            const searchInput = jQuery('<input type="text">')
                .attr('placeholder', instanceData.config.searchPromptText)
                .on('keyup.hierarchicalBrowser', debounce(function(event) {
                    const filterTerm = jQuery(this).val().toLowerCase().trim(); // Trim whitespace.
                    // Find all sibling list items (excluding the search row itself).
                    const listItems = jQuery(this).closest('.browser-column').find('> ul > li:not(.search-row)');

                    if (filterTerm.length >= 2) { // Only filter if term is at least 2 characters long.
                        listItems.each(function() {
                            const itemLabel = jQuery(this).data('item-details')?.label?.toLowerCase() || '';
                            if (itemLabel.includes(filterTerm)) {
                                jQuery(this).show();
                            } else {
                                jQuery(this).hide();
                            }
                        });
                    } else {
                        listItems.show(); // Show all items if the filter term is too short or empty.
                    }
                }, 250)); // Debounce for 250ms to reduce excessive filtering.

            searchRow.append(searchInput).appendTo(targetListElement);
        },

        // Inserts a new column into the browser's composition area.
        _insertColumn: function(contentDomNode) {
            // 'this' is bound to the root container DOM element.
            const instanceData = jQuery(this).data("browserInstance");
            if (!instanceData) {
                console.error("Browser instance data not found for root element during column insertion.");
                return;
            }

            // Create the new column wrapper element.
            const columnWrapperElement = jQuery("<div></div>")
                .addClass("browser-column")
                .append(contentDomNode); // Append the provided content (list or message).

            // Append the new column to the main composition area.
            jQuery(instanceData.rootContainer)
                .find(".browser-column-composition")
                .append(columnWrapperElement);

            // Scroll the container horizontally to bring the newly added column into view.
            // A short animation provides a smoother user experience.
            jQuery(instanceData.rootContainer).animate({
                scrollLeft: jQuery(".browser-column-composition").width()
            }, 200); // Animation duration of 200ms.
        },

        // Clears all columns that are positioned to the right of a specified column level.
        _clearSubsequentColumns: function(startingLevel) {
            // 'this' is bound to the root container DOM element.
            const instanceData = jQuery(this).data("browserInstance");
            if (!instanceData) {
                console.error("Browser instance data not found for root element during column clearing.");
                return;
            }
            // Select and remove columns whose index is greater than the startingLevel.
            jQuery(instanceData.rootContainer)
                .find(`.browser-column-composition > .browser-column:gt(${startingLevel})`)
                .remove();
        },

        // Public method to refresh the current column.
        // This could be extended to refresh a specific column by ID.
        refresh: function() {
            // 'this' refers to the jQuery selection.
            return this.each(function() {
                const instanceData = jQuery(this).data("browserInstance");
                if (instanceData) {
                    const lastColumn = jQuery(instanceData.rootContainer).find('.browser-column-composition > .browser-column').last();
                    if (lastColumn.length > 0) {
                        const lastColumnIndex = lastColumn.index();
                        instanceData._clearSubsequentColumns(lastColumnIndex - 1); // Clear the last column itself.
                        // Re-fetch data for the parent of the last column, or the root if it was the first column.
                        // This part needs more sophisticated logic to know which data to re-fetch.
                        // For simplicity in this clone, we'll just re-trigger initial load if no columns are left.
                        if (lastColumnIndex === 0) {
                             instanceData.config.resourceProvider(null, function(errorPayload, initialData) {
                                if (errorPayload) {
                                    return console.error("Refresh failed:", errorPayload);
                                }
                                instanceData._renderContentList(initialData);
                            });
                        } else {
                            // More complex logic needed here to determine what data to reload.
                            // For a Type III clone, a simple refresh might just clear and reload the first column.
                            console.warn("Refresh functionality for specific columns needs further implementation.");
                            instanceData._clearSubsequentColumns(-1); // Clear all columns.
                            instanceData.config.resourceProvider(null, function(errorPayload, initialData) {
                                if (errorPayload) {
                                    return console.error("Refresh failed:", errorPayload);
                                }
                                instanceData._renderContentList(initialData);
                            });
                        }
                    } else {
                        // If no columns, just load the first one.
                        instanceData.config.resourceProvider(null, function(errorPayload, initialData) {
                            if (errorPayload) {
                                return console.error("Refresh failed:", errorPayload);
                            }
                            instanceData._renderContentList(initialData);
                        });
                    }
                }
            });
        },

        // Public method to destroy the browser instance and clean up.
        destroy: function() {
            return this.each(function() {
                const containerElement = jQuery(this);
                const instanceData = containerElement.data("browserInstance");
                if (instanceData) {
                    // Remove event listeners.
                    containerElement.off(".hierarchicalBrowser");
                    // Remove added classes.
                    containerElement.removeClass("hierarchical-browser-wrapper");
                    // Remove the composition area and its contents.
                    containerElement.find(".browser-column-composition").remove();
                    // Clear the stored instance data.
                    containerElement.removeData("browserInstance");
                    console.log("Hierarchical browser instance destroyed.");
                }
            });
        }
    };

    // Define the jQuery plugin.
    jQuery.fn.hierarchicalBrowser = function(method) {
        // Handle method calls (e.g., `$('.selector').hierarchicalBrowser('refresh')`)
        if (typeof method === 'string' && componentOperations[method]) {
            // Apply the specified method to the selected elements, passing arguments.
            return componentOperations[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            // If no method name is given, or an options object is passed, initialize the component.
            return componentOperations.initialize.apply(this, arguments);
        } else {
            // Throw an error if an unknown method is called.
            jQuery.error('Method "' + method + '" does not exist on jQuery.hierarchicalBrowser');
        }
    };

})(jQuery);