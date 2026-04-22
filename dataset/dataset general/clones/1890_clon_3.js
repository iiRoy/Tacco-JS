;(function ($, window, document, undefined) {

    /**
     * Expert-level infinite scrolling and content virtualization utility.
     * This module efficiently manages display of large lists or grids by dynamically loading and unloading
     * content based on user scroll position, minimizing DOM footprint and memory usage.
     * It operates by maintaining a 'window' of content within a larger virtual scrollable area.
     */
    class InfiniteScroller {
        /**
         * Constructs a new instance of the InfiniteScroller.
         * Sets up the initial configuration, DOM references, and internal state.
         *
         * @param {HTMLElement} targetElement - The root DOM element where the scroller will be initialized.
         * @param {object} userSettings - Configuration options provided by the user to override defaults.
         */
        constructor(targetElement, userSettings) {
            // Core configuration values with robust defaults.
            const baseSettings = {
                pluginIdentifier: 'virtual-scroll', // Unique identifier for generated IDs and event namespaces.
                scrollContainer: null,              // Specifies the element responsible for scrolling (defaults to window).
                enableLogging: false,               // Toggles console output for debugging purposes.
                eventHooks: {                       // Custom event names for external interaction points.
                    requestData: 'dataRequest.virtualScroll',     // Triggered when new content is needed.
                    receiveData: 'dataResponse.virtualScroll',    // Listens for external data responses.
                    scrollStart: 'scrollUpdateStart.virtualScroll', // Fired when content block rendering begins.
                    scrollStop: 'scrollUpdateEnd.virtualScroll'   // Fired when content block rendering completes.
                },
                timingConfig: {                     // Timing parameters for internal operations.
                    scrollDebounceDelay: 500,       // Milliseconds to wait after scroll activity ceases before requesting content.
                    feedbackInterval: 200,          // Frequency (ms) of checks for scroll/resize changes.
                    queueProcessingInterval: 100    // Frequency (ms) of checks for matching requests and responses.
                },
                loadingIndicatorGenerator: null,    // A function that returns HTML for a loading placeholder.
                cssClasses: {                       // Customizable CSS classes for structural elements.
                    listContainer: null,            // Class applied to the main <ol> element.
                    listItem: null                  // Class applied to each <li> item.
                }
            };

            // Merge base settings with user-provided overrides using modern object spread syntax.
            this.configuration = { ...baseSettings, ...userSettings };

            // Initialize internal data structures for managing state and resources.
            this.domElements = {};          // Cache for jQuery objects representing key DOM elements.
            this.layoutMetrics = {};        // Stores calculated dimensions and counts related to content layout.
            this.activeTimers = {};         // Collection of active setInterval/setTimeout IDs for cleanup.
            this.pendingRequests = [];      // Queue for content requests awaiting a response.
            this.incomingResponses = [];    // Queue for received content responses awaiting processing.

            // Cache the root jQuery element where the scroller is attached.
            this.domElements.$rootContainer = $(targetElement);

            // Generate the initial HTML structure and populate the DOM elements cache.
            this.domElements.$rootContainer.html(this._generateInitialMarkup());
            Object.assign(this.domElements, this._cacheDomReferences());

            // Ensure the designated scrollable area has vertical scrollbars.
            // This is a critical prerequisite for the scroller's functionality.
            const currentOverflow = this.domElements.$scrollArea.css('overflow-y');
            if (currentOverflow === 'visible' || currentOverflow === 'hidden') {
                this.domElements.$scrollArea.css('overflow-y', 'scroll');
            }

            // Flags to track user interaction and internal state.
            this.hasScrolled = false;           // True if a scroll event has occurred since last check.
            this.hasResized = false;            // True if a resize event requires layout recalculation.
            this.currentTopOffsetRows = 0;      // Number of logical rows hidden by the top spacer element.
            this.scrollDebounceTimer = null;    // Timer ID for debouncing scroll-triggered content requests.
        }

        /**
         * Generates the essential HTML structure (a top spacer and an ordered list)
         * that forms the basis of the virtual scroll display.
         *
         * @returns {string} The HTML string representing the initial scroller structure.
         * @private
         */
        _generateInitialMarkup() {
            const topSpacerElementId = `${this.configuration.pluginIdentifier}-top-spacer`;
            const contentBlockElementId = `${this.configuration.pluginIdentifier}-content-block`;
            const customListCssClass = this.configuration.cssClasses.listContainer;

            // Using template literals for clear and concise HTML generation.
            let generatedMarkup = `<div id="${topSpacerElementId}"></div>`;
            generatedMarkup += customListCssClass
                ? `<ol id="${contentBlockElementId}" class="${customListCssClass}"></ol>`
                : `<ol id="${contentBlockElementId}"></ol>`;

            return generatedMarkup;
        }

        /**
         * Retrieves and caches jQuery references to the dynamically created DOM elements.
         * This prevents repeated DOM lookups and improves performance.
         *
         * @returns {object} An object containing jQuery-wrapped DOM elements.
         * @private
         */
        _cacheDomReferences() {
            // Determine the actual scrollable container. If `scrollContainer` is a function, execute it.
            const scrollAreaReference = this.configuration.scrollContainer;
            const $scrollAreaElement = (typeof scrollAreaReference === 'function')
                ? scrollAreaReference()
                : $(window); // Default to window if no specific container is provided.

            // Select the top spacer and content block elements by their generated IDs.
            const $topSpacerElement = $(`#${this.configuration.pluginIdentifier}-top-spacer`);
            const $contentBlockElement = $(`#${this.configuration.pluginIdentifier}-content-block`);

            return {
                $scrollArea: $scrollAreaElement,
                $topSpacer: $topSpacerElement,
                $contentBlock: $contentBlockElement
            };
        }

        /**
         * Initializes the scroller with specific content dimensions and buffer settings.
         * This method is crucial and must be called after the constructor to activate content loading.
         *
         * @param {object} initializationOptions - Object containing content-specific configuration.
         * @param {number} initializationOptions.displayBufferRows - Number of extra rows to render beyond the viewport.
         * @param {object} initializationOptions.itemDimensions - Details about the individual items.
         * @param {number} initializationOptions.itemDimensions.totalItems - The total count of all items in the virtual list.
         * @param {number} initializationOptions.itemDimensions.itemHeight - The fixed height (in pixels) of a single item.
         * @param {number} initializationOptions.itemDimensions.itemWidth - The fixed width (in pixels) of a single item.
         * @throws {TypeError} If essential initialization options are missing or malformed.
         */
        initialize(initializationOptions) {
            // Comprehensive validation for critical initialization parameters.
            if (!initializationOptions ||
                typeof initializationOptions.displayBufferRows !== 'number' ||
                typeof initializationOptions.itemDimensions !== 'object' ||
                !initializationOptions.itemDimensions ||
                typeof initializationOptions.itemDimensions.totalItems !== 'number' ||
                typeof initializationOptions.itemDimensions.itemHeight !== 'number' ||
                typeof initializationOptions.itemDimensions.itemWidth !== 'number' ||
                initializationOptions.itemDimensions.totalItems < 0 ||
                initializationOptions.itemDimensions.itemHeight <= 0 ||
                initializationOptions.itemDimensions.itemWidth <= 0) {
                throw new TypeError("InfiniteScroller: Malformed or missing essential initialization options.");
            }

            // Store the provided content dimensions and buffer settings.
            this.configuration.displayBufferRows = initializationOptions.displayBufferRows;
            this.configuration.itemDimensions = initializationOptions.itemDimensions;

            // Enforce a minimum buffer to ensure smooth scrolling and partial row visibility.
            if (this.configuration.displayBufferRows < 2) {
                this.configuration.displayBufferRows = 2;
            }

            // If there are no items, clear the content block and return early.
            if (this.configuration.itemDimensions.totalItems === 0) {
                this.domElements.$contentBlock.empty();
                return;
            }

            // Calculate and store fundamental layout metrics based on current dimensions.
            this.layoutMetrics = this._calculateLayoutMetrics();

            // Apply calculated heights to the root container and the content block.
            this.domElements.$rootContainer.height(
                this.layoutMetrics.totalContentRows * this.configuration.itemDimensions.itemHeight
            );
            this.domElements.$contentBlock.height(
                this.layoutMetrics.visibleBlockRows * this.configuration.itemDimensions.itemHeight
            );

            // Start the background processes for handling content requests and responses.
            this._activateProcessingQueues();
            // Bind the custom event listener that receives content data from external sources.
            this._bindResponseHandler();

            // Perform the initial content load, starting from the top.
            this.domElements.$scrollArea.scrollTop(0);
            this.domElements.$topSpacer.height(0);
            this.currentTopOffsetRows = 0; // Reset initial offset.
            // The initial load does not require debouncing, so content is rendered directly.
            this._manageContentUpdate('initial_load', 0, this.layoutMetrics.itemsInVisibleBlock, null, false);

            // Attach the scroll event listener and kick off the continuous feedback loop.
            this.domElements.$scrollArea.on('scroll.virtualScroll', () => { this.hasScrolled = true; }); // Namespaced event.
            this.activeTimers.feedback = window.setInterval(() => {
                this._processScrollFeedback();
            }, this.configuration.timingConfig.feedbackInterval);
        }

        /**
         * Computes key layout metrics such as items per row, total content rows,
         * and the dimensions of the visible content block.
         *
         * @returns {object} An object containing all derived layout metrics.
         * @private
         */
        _calculateLayoutMetrics() {
            const { itemDimensions } = this.configuration;
            const contentBlockWidth = this.domElements.$contentBlock.width();
            const scrollAreaHeight = this.domElements.$scrollArea.height();

            // Determine how many items can fit horizontally within the content block.
            let itemsPerRow = Math.floor(contentBlockWidth / itemDimensions.itemWidth);
            itemsPerRow = Math.max(1, itemsPerRow); // Ensure at least one item per row.

            // Calculate the total number of rows required to display all items.
            const totalContentRows = Math.ceil(itemDimensions.totalItems / itemsPerRow);

            // Determine the number of rows visible within the scrollable viewport.
            let viewportRows = Math.ceil(scrollAreaHeight / itemDimensions.itemHeight);
            viewportRows = Math.max(1, viewportRows); // Ensure at least one viewport row.

            // Calculate the total rows in the dynamic content block (viewport + buffer).
            let visibleBlockRows = viewportRows + (2 * this.configuration.displayBufferRows);
            // Limit the block rows to the total content rows if the content is smaller.
            visibleBlockRows = Math.min(visibleBlockRows, totalContentRows);

            // Calculate the total number of items contained within the visible block.
            let itemsInVisibleBlock = visibleBlockRows * itemsPerRow;
            // Limit items in block to the total item count.
            itemsInVisibleBlock = Math.min(itemsInVisibleBlock, itemDimensions.totalItems);

            return {
                itemsPerRow,
                totalContentRows,
                visibleBlockRows,
                itemsInVisibleBlock
            };
        }

        /**
         * Initiates an interval-based loop to continuously process pending content requests
         * and match them with incoming responses. This ensures content is updated as data arrives.
         *
         * @private
         */
        _activateProcessingQueues() {
            this.activeTimers.queue = window.setInterval(() => {
                // Keep processing as long as there are requests and potential responses.
                while (this.pendingRequests.length > 0 && this.incomingResponses.length > 0) {
                    const currentRequest = this.pendingRequests[0];
                    // Find a matching response by comparing start index and expected item count.
                    // Responses might not arrive in the order requests were made.
                    const responseIndex = this.incomingResponses.findIndex(responsePayload =>
                        responsePayload.start === currentRequest.startIndex &&
                        Array.isArray(responsePayload.liHtml) &&
                        responsePayload.liHtml.length === currentRequest.itemCount
                    );

                    if (responseIndex !== -1) {
                        // If a match is found, remove both from their respective queues and process.
                        const matchedResponse = this.incomingResponses[responseIndex];
                        this.pendingRequests.shift(); // Remove the oldest request.
                        this.incomingResponses.splice(responseIndex, 1); // Remove the matched response.
                        this._updateContentWithResponse(currentRequest, matchedResponse);
                    } else {
                        // If the first request in the queue has no matching response yet,
                        // stop processing for this cycle to avoid blocking later requests that might have responses.
                        break;
                    }
                }
            }, this.configuration.timingConfig.queueProcessingInterval);
        }

        /**
         * Binds the custom event handler for when external content responses are received.
         * Valid responses are pushed into the `incomingResponses` queue for processing.
         *
         * @private
         */
        _bindResponseHandler() {
            this.domElements.$rootContainer.on(this.configuration.eventHooks.receiveData, (event, data) => {
                // Validate the basic structure and types of the incoming response data.
                const isValidResponse = data &&
                    typeof data.start === 'number' &&
                    Array.isArray(data.liHtml) &&
                    (!data.liData || typeof data.liData === 'object') &&
                    (!data.liClass || Array.isArray(data.liClass)); // Ensure liClass is an array if present.

                if (!isValidResponse) {
                    // Log a warning for malformed data, but do not throw to prevent application crash.
                    if (this.configuration.enableLogging) {
                        console.warn(`InfiniteScroller: Received malformed response data, ignoring.`, data);
                    }
                    return;
                }

                this.incomingResponses.push(data);
            });
        }

        /**
         * The primary feedback loop that continuously monitors for scroll and resize events.
         * It determines if the content block needs to be updated and triggers the necessary actions.
         * This method is executed periodically by `setInterval`.
         *
         * @private
         */
        _processScrollFeedback() {
            // If no scroll or resize activity, exit early to save CPU cycles.
            if (!this.hasResized && !this.hasScrolled) {
                return;
            }

            // Calculate the number of rows that logically precede the visible content block.
            const currentScrollTop = this.domElements.$scrollArea.scrollTop();
            const calculatedTopOffsetRows = this._determineTopSpacerRows(
                Math.floor(currentScrollTop / this.configuration.itemDimensions.itemHeight)
            );

            // If not resized and the top offset hasn't changed, reset flags and wait for the next cycle.
            if (!this.hasResized && calculatedTopOffsetRows === this.currentTopOffsetRows) {
                this.hasScrolled = false;
                return;
            }

            // Adjust the height of the top spacer to simulate scrolling.
            this.domElements.$topSpacer.height(calculatedTopOffsetRows * this.configuration.itemDimensions.itemHeight);

            let scrollEventType, startIndex, itemCount, itemsToRemove;

            const verticalRowChange = calculatedTopOffsetRows - this.currentTopOffsetRows;
            const isSmallScrollChange = Math.abs(verticalRowChange) < this.layoutMetrics.visibleBlockRows;

            if (!this.hasResized && isSmallScrollChange) {
                // Incremental update: For small scrolls, add/remove items from ends of the block.
                scrollEventType = (verticalRowChange < 0) ? 'scroll_up' : 'scroll_down';

                const { totalItems } = this.configuration.itemDimensions;
                const { itemsPerRow, visibleBlockRows, totalContentRows } = this.layoutMetrics;
                const hasPartialLastRow = (totalItems % itemsPerRow) !== 0;

                if (scrollEventType === 'scroll_up') {
                    // Scrolling upwards: New items added to the top, old items removed from the bottom.
                    startIndex = calculatedTopOffsetRows * itemsPerRow;
                    itemCount = -verticalRowChange * itemsPerRow; // Number of items to add.

                    // Adjust `itemsToRemove` if the current block includes a partial last row.
                    if ((this.currentTopOffsetRows === totalContentRows - visibleBlockRows) && hasPartialLastRow) {
                        itemsToRemove = itemCount - itemsPerRow + (totalItems % itemsPerRow);
                    } else {
                        itemsToRemove = itemCount;
                    }
                } else { // scrollEventType === 'scroll_down'
                    // Scrolling downwards: New items added to the bottom, old items removed from the top.
                    startIndex = itemsPerRow * (this.currentTopOffsetRows + visibleBlockRows);
                    itemsToRemove = verticalRowChange * itemsPerRow; // Number of items to remove.

                    // Adjust `itemCount` if the new block will include a partial last row.
                    if ((calculatedTopOffsetRows === totalContentRows - visibleBlockRows) && hasPartialLastRow) {
                        itemCount = itemsToRemove - itemsPerRow + (totalItems % itemsPerRow);
                    } else {
                        itemCount = itemsToRemove;
                    }
                }
            } else {
                // Full block reload: Triggered by large scrolls or window resizing.
                scrollEventType = 'full_reload';
                startIndex = calculatedTopOffsetRows * this.layoutMetrics.itemsPerRow;
                itemsToRemove = null; // A null value signifies a complete replacement of the block content.

                // Adjust `itemCount` for the last block if it contains a partial row.
                if (startIndex + this.layoutMetrics.itemsInVisibleBlock <= this.configuration.itemDimensions.totalItems) {
                    itemCount = this.layoutMetrics.itemsInVisibleBlock;
                } else {
                    itemCount = this.layoutMetrics.itemsInVisibleBlock - this.layoutMetrics.itemsPerRow +
                        (this.configuration.itemDimensions.totalItems % this.layoutMetrics.itemsPerRow);
                }
            }

            // Delegate the content rendering and request logic.
            this._manageContentUpdate(scrollEventType, startIndex, itemCount, itemsToRemove, true);

            // Update the stored number of top offset rows for the next comparison.
            this.currentTopOffsetRows = calculatedTopOffsetRows;

            // Reset interaction flags.
            this.hasScrolled = false;
            this.hasResized = false;
        }

        /**
         * Calculates the appropriate number of rows that should be represented by the top spacer element.
         * This ensures the content block stays within the defined buffer zone relative to the viewport.
         *
         * @param {number} scrolledRows - The current number of rows scrolled from the very top of the content.
         * @returns {number} The calculated height (in rows) for the top spacer.
         * @private
         */
        _determineTopSpacerRows(scrolledRows) {
            const { totalItems } = this.configuration.itemDimensions;
            const { itemsInVisibleBlock, totalContentRows, visibleBlockRows } = this.layoutMetrics;
            const { displayBufferRows } = this.configuration;

            // If all items fit within a single visible block, no virtual scrolling (and thus no spacer) is needed.
            if (totalItems <= itemsInVisibleBlock) {
                return 0;
            }

            // Logic to dynamically adjust the top spacer height based on scroll position and buffer.
            if (scrolledRows < displayBufferRows) {
                // If scrolled less than the buffer, the content block starts at the logical top.
                return 0;
            } else if (scrolledRows < totalContentRows - visibleBlockRows + displayBufferRows) {
                // Within the main scrolling region, adjust by the buffer size.
                return scrolledRows - displayBufferRows;
            } else {
                // When scrolled near the bottom, the content block is fixed at the logical bottom of content.
                return totalContentRows - visibleBlockRows;
            }
        }

        /**
         * Orchestrates the rendering of content placeholders and manages the debounced
         * triggering of external content requests.
         *
         * @param {string} type - The type of content update (e.g., 'scroll_up', 'full_reload').
         * @param {number} startIndex - The global index of the first item to be displayed in the block.
         * @param {number} itemCount - The total number of items to provision space for in the block.
         * @param {number|null} itemsToRemove - For incremental updates, specifies how many items to remove.
         * @param {boolean} enableDebounce - If true, content requests are debounced; otherwise, they're immediate.
         * @private
         */
        _manageContentUpdate(type, startIndex, itemCount, itemsToRemove, enableDebounce) {
            // First, render the block with placeholder HTML.
            this._renderBlockContent({
                type: type,
                startIndex: startIndex,
                itemCount: itemCount,
                itemsToRemove: itemsToRemove
            });

            // If debouncing is explicitly disabled (e.g., for initial page load), request content immediately.
            if (!enableDebounce) {
                this._requestMissingContent();
                return;
            }

            // Clear any previously set debounce timer to reset the delay.
            if (this.scrollDebounceTimer) {
                window.clearTimeout(this.scrollDebounceTimer);
            }

            // Set a new timer to request content only after a period of scroll inactivity.
            this.scrollDebounceTimer = window.setTimeout(() => {
                this._requestMissingContent();
            }, this.configuration.timingConfig.scrollDebounceDelay);
        }

        /**
         * Scans the current content block for empty placeholder items and generates
         * external requests to retrieve their actual content.
         *
         * @private
         */
        _requestMissingContent() {
            const loadingCssClass = `${this.configuration.pluginIdentifier}-loading`;
            const itemIdPrefix = `${this.configuration.pluginIdentifier}-id-`;

            let blockGlobalStartIndex = -1; // The global index of the first item currently rendered in the block.
            const placeholderStatusArray = []; // Boolean array: true if item is a placeholder, false if loaded.

            // Iterate over each list item in the content block to determine its status.
            this.domElements.$contentBlock.children().each((index, listItemElement) => {
                const $listItem = $(listItemElement);
                if (index === 0) {
                    // Extract the global index from the first item's ID attribute.
                    const idAttribute = $listItem.attr('id');
                    if (idAttribute) {
                        blockGlobalStartIndex = parseInt(idAttribute.replace(itemIdPrefix, ''), 10);
                    }
                }
                // Check if the item's immediate child has the loading class, indicating a placeholder.
                placeholderStatusArray.push($listItem.children().first().hasClass(loadingCssClass));
            });

            // If no items are in the block or ID parsing failed, there's nothing to request.
            if (blockGlobalStartIndex === -1 || placeholderStatusArray.length === 0) {
                return;
            }

            // Identify contiguous segments of placeholders within the block.
            const contentGapSegments = this._identifyContentGaps(placeholderStatusArray);

            // For each identified segment of placeholders, dispatch a content request.
            contentGapSegments.forEach(gap => {
                if (gap.value === true) { // 'true' indicates this segment is composed of placeholders.
                    const requestPayload = {
                        startIndex: blockGlobalStartIndex + gap.start,
                        itemCount: gap.count
                    };
                    this.pendingRequests.push(requestPayload);
                    // Trigger a custom event for external listeners to fetch data.
                    this.domElements.$rootContainer.trigger(this.configuration.eventHooks.requestData, requestPayload);
                }
            });
        }

        /**
         * Analyzes a boolean array to find contiguous runs of identical values.
         * This is used to group adjacent placeholder items into single content requests.
         * Example: `[T, T, F, T]` -> `[{start:0, count:2, value:T}, {start:2, count:1, value:F}, {start:3, count:1, value:T}]`
         *
         * @param {boolean[]} inputArray - An array of booleans (e.g., placeholder status).
         * @returns {Array<object>} An array of objects, each describing a run segment (start index, count, value).
         * @private
         */
        _identifyContentGaps(inputArray) {
            if (!inputArray || inputArray.length === 0) {
                return [];
            }

            const runSegments = [];
            let currentRunStart = 0;
            let currentRunValue = inputArray[0];
            let currentRunCount = 0;

            // Iterate through the array to find changes in value.
            for (let i = 0; i < inputArray.length; i++) {
                if (inputArray[i] === currentRunValue) {
                    currentRunCount++;
                } else {
                    // Current run ended, record it and start a new one.
                    runSegments.push({
                        start: currentRunStart,
                        count: currentRunCount,
                        value: currentRunValue
                    });
                    currentRunStart = i;
                    currentRunValue = inputArray[i];
                    currentRunCount = 1;
                }
            }
            // After the loop, ensure the final run segment is also added.
            runSegments.push({
                start: currentRunStart,
                count: currentRunCount,
                value: currentRunValue
            });

            return runSegments;
        }

        /**
         * Renders (or re-renders) the content block with a specified number of placeholder items.
         * This method dynamically modifies the DOM structure of the content block.
         *
         * @param {object} updateDetails - Object containing parameters for the content block modification.
         * @param {string} updateDetails.type - Type of update ('scroll_down', 'scroll_up', 'full_reload', 'initial_load').
         * @param {number} updateDetails.startIndex - The global starting index for items in the new block.
         * @param {number} updateDetails.itemCount - The total number of items (placeholders) to render.
         * @param {number|null} updateDetails.itemsToRemove - For incremental updates, the number of items to remove.
         * @private
         */
        _renderBlockContent(updateDetails) {
            // Trigger an event to signal the start of content block rendering.
            const startEventHook = this.configuration.eventHooks.scrollStart;
            if (startEventHook) {
                this.domElements.$rootContainer.trigger(startEventHook);
            }

            // Generate the HTML for a single loading indicator.
            const loadingIndicatorClass = `${this.configuration.pluginIdentifier}-loading`;
            const defaultLoadingHtml = `<div class="${loadingIndicatorClass}"></div>`;
            const customLoadingHtml = typeof this.configuration.loadingIndicatorGenerator === 'function'
                ? this.configuration.loadingIndicatorGenerator()
                : ''; // Fallback to empty string if no custom generator.

            let completeItemsHtml = '';
            const listItemCssClass = this.configuration.cssClasses.listItem;
            const itemIdPrefix = `${this.configuration.pluginIdentifier}-id-`;

            // Construct the HTML for all placeholder list items.
            for (let i = 0; i < updateDetails.itemCount; i++) {
                const globalItemIndex = updateDetails.startIndex + i;
                const listItemDomId = `${itemIdPrefix}${globalItemIndex}`;

                const listItemMarkup = listItemCssClass
                    ? `<li id="${listItemDomId}" class="${listItemCssClass}">${defaultLoadingHtml}${customLoadingHtml}</li>`
                    : `<li id="${listItemDomId}">${defaultLoadingHtml}${customLoadingHtml}</li>`;

                completeItemsHtml += listItemMarkup;
            }

            // Apply the generated HTML to the content block based on the update type.
            switch (updateDetails.type) {
                case 'scroll_down':
                    // Append new items to the bottom and remove older items from the top.
                    this.domElements.$contentBlock.append(completeItemsHtml);
                    if (typeof updateDetails.itemsToRemove === 'number' && updateDetails.itemsToRemove > 0) {
                        this.domElements.$contentBlock.children().slice(0, updateDetails.itemsToRemove).remove();
                    }
                    break;
                case 'scroll_up':
                    // Prepend new items to the top and remove older items from the bottom.
                    this.domElements.$contentBlock.prepend(completeItemsHtml);
                    if (typeof updateDetails.itemsToRemove === 'number' && updateDetails.itemsToRemove > 0) {
                        this.domElements.$contentBlock.children().slice(-updateDetails.itemsToRemove).remove();
                    }
                    break;
                case 'full_reload':
                case 'initial_load': // Both types perform a full replacement of content.
                    this.domElements.$contentBlock.html(completeItemsHtml);
                    break;
                default:
                    if (this.configuration.enableLogging) {
                        console.warn(`InfiniteScroller: Encountered unknown content update type: ${updateDetails.type}`);
                    }
                    break;
            }
        }

        /**
         * Updates placeholder list items within the content block with actual content
         * received from a data response. This replaces loading indicators with real item HTML.
         *
         * @param {object} originalRequest - The original request payload that triggered this response.
         * @param {object} receivedResponse - The response payload containing content details.
         * @param {string[]} receivedResponse.liHtml - Array of HTML strings for each item.
         * @param {object[]} [receivedResponse.liData] - Optional array of data objects to attach to items.
         * @param {string[]} [receivedResponse.liClass] - Optional array of additional CSS classes for items.
         * @private
         */
        _updateContentWithResponse(originalRequest, receivedResponse) {
            const itemIdPrefix = `${this.configuration.pluginIdentifier}-id-`;
            const firstTargetItemId = `${itemIdPrefix}${originalRequest.startIndex}`;
            // The ID for the item *after* the last one in the range, used for `nextUntil`.
            const lastTargetItemIdExclusive = `${itemIdPrefix}${originalRequest.startIndex + originalRequest.itemCount}`;

            // Select the exact range of list items that need to be updated.
            const $firstElement = $(`#${firstTargetItemId}`);
            const $elementsToUpdate = $firstElement.add($firstElement.nextUntil(`#${lastTargetItemIdExclusive}`));

            // Iterate over the selected elements and apply the response data.
            $elementsToUpdate.each((index, element) => {
                const $currentElement = $(element);

                // Replace the placeholder content with the actual HTML for the item.
                if (receivedResponse.liHtml && receivedResponse.liHtml[index]) {
                    $currentElement.html(receivedResponse.liHtml[index]);
                }

                // Attach any optional data key-value pairs to the element.
                if (receivedResponse.liData && typeof receivedResponse.liData[index] === 'object') {
                    for (const dataKey in receivedResponse.liData[index]) {
                        // Ensure it's an own property to avoid inherited properties.
                        if (Object.prototype.hasOwnProperty.call(receivedResponse.liData[index], dataKey)) {
                            $currentElement.data(dataKey, receivedResponse.liData[index][dataKey]);
                        }
                    }
                }

                // Add any optional additional CSS classes to the element.
                if (receivedResponse.liClass && typeof receivedResponse.liClass[index] === 'string') {
                    $currentElement.addClass(receivedResponse.liClass[index]);
                }
            });

            // Trigger an event to signal the completion of content block rendering.
            const stopEventHook = this.configuration.eventHooks.scrollStop;
            if (stopEventHook) {
                this.domElements.$rootContainer.trigger(stopEventHook);
            }
        }

        /**
         * Retrieves the total calculated height of the entire virtual content stream,
         * encompassing all items, even those not currently in the DOM.
         *
         * @returns {number} The total height of the content in pixels.
         */
        getTotalHeight() {
            // Guard clause: return 0 if layout metrics are not yet calculated.
            if (!this.layoutMetrics.totalContentRows || !this.configuration.itemDimensions.itemHeight) {
                return 0;
            }
            return this.layoutMetrics.totalContentRows * this.configuration.itemDimensions.itemHeight;
        }

        /**
         * Returns the number of items that can horizontally fit into a single row
         * based on the current layout and item width.
         *
         * @returns {number} The count of items per visible row.
         */
        getVisibleItemsPerRow() {
            // Guard clause: return 0 if layout metrics are not yet calculated.
            if (!this.layoutMetrics.itemsPerRow) {
                return 0;
            }
            return this.layoutMetrics.itemsPerRow;
        }

        /**
         * Recalculates all layout metrics and triggers a full content block reload
         * if the scroller's dimensions or the containing element's dimensions have changed.
         * This method should be called when a resize event is detected externally.
         */
        recalculateLayout() {
            // If the scroller hasn't been fully initialized, ignore resize events.
            if (!this.configuration.itemDimensions) {
                return;
            }

            const newLayoutMetrics = this._calculateLayoutMetrics();

            // Determine if any layout-critical metrics have actually changed.
            const layoutHasChanged = newLayoutMetrics.itemsPerRow !== this.layoutMetrics.itemsPerRow ||
                newLayoutMetrics.visibleBlockRows !== this.layoutMetrics.visibleBlockRows ||
                newLayoutMetrics.totalContentRows !== this.layoutMetrics.totalContentRows;

            if (!layoutHasChanged) {
                return; // No layout change, no action needed.
            }

            // Update to the new layout metrics.
            this.layoutMetrics = newLayoutMetrics;

            // Clear all pending requests and responses, as they might be for the old layout.
            // Using `length = 0` is an efficient way to empty an array.
            this.pendingRequests.length = 0;
            this.incomingResponses.length = 0;

            // Mark the scroller as having been resized, which will trigger a full reload.
            this.hasResized = true;

            // Immediately trigger the feedback loop to process the resize without waiting for the interval.
            this._processScrollFeedback();
        }

        /**
         * Performs a complete cleanup of the scroller instance, stopping all timers,
         * unbinding event listeners, and nullifying references to prevent memory leaks.
         * This effectively "destroys" the scroller.
         */
        destroy() {
            // Stop all active `setInterval` and `setTimeout` timers.
            for (const timerKey in this.activeTimers) {
                if (Object.prototype.hasOwnProperty.call(this.activeTimers, timerKey)) {
                    // Clear both interval and timeout as a robust cleanup measure.
                    clearInterval(this.activeTimers[timerKey]);
                    clearTimeout(this.activeTimers[timerKey]);
                }
            }
            this.activeTimers = {}; // Reset the timers collection.

            // Unbind all custom event handlers attached to the root container, using the namespace.
            this.domElements.$rootContainer.off('.virtualScroll');

            // Unbind the native scroll event handler from the scroll area.
            this.domElements.$scrollArea.off('scroll.virtualScroll');

            // Optionally, clear the HTML of the root container.
            this.domElements.$rootContainer.empty();

            // Nullify all major object references to aid garbage collection.
            this.domElements = null;
            this.layoutMetrics = null;
            this.configuration = null;
            this.pendingRequests = null;
            this.incomingResponses = null;
        }
    }

    // Integrate the InfiniteScroller class as a jQuery plugin.
    // This allows for easy instantiation and method calls via jQuery selectors.
    $.fn.infiniteScroller = function (options) {
        // 'this' in a jQuery plugin context refers to the jQuery object
        // containing the selected DOM elements.
        return this.each(function () {
            // Prevent multiple initializations on the same DOM element.
            // Store the plugin instance directly on the element's jQuery data.
            if (!$.data(this, 'plugin_infiniteScroller')) {
                $.data(this, 'plugin_infiniteScroller', new InfiniteScroller(this, options));
            }
        });
    };

})(jQuery, window, document);