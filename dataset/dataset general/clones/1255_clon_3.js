(function(jq){

    // Ensure jQuery is available before proceeding.
    if (!jq || !jq.fn) {
        console.warn("Dynamic Content Loader requires jQuery to be loaded.");
        return;
    }

    /**
     * @fileoverview Dynamic Content Loader - A jQuery plugin for deferred content loading.
     * @version 1.1.0
     * @license GNU General Public License v3 or later.
     * @author J. Smith (based on original work by JasonLau.biz)
     * @date 2023-10-27
     *
     * This module provides functionality to load content (images, HTML fragments,
     * AJAX data) into elements only when they become visible within a
     * scrollable container or the browser viewport. It supports various
     * loading behaviors like replace, append, prepend, before, after, and repeat.
     *
     * For detailed licensing information, please refer to:
     * http://www.gnu.org/licenses/
     */

    jq.fn.augment({
        /**
         * Initializes the dynamic content loading behavior on selected elements.
         * @param {object} pluginConfig - Configuration options for the loader.
         * @param {string} [pluginConfig.loadingIndicatorMarkup='Loading content...'] - HTML to display while content is loading.
         * @param {number} [pluginConfig.fadeDuration=400] - Duration in milliseconds for fade animations.
         * @returns {jQuery} The jQuery object to allow for method chaining.
         */
        dynamicContentLoader: function(pluginConfig) {

            // Define default settings for the plugin.
            const standardSettings = {
                loadingIndicatorMarkup : 'Loading content... ',
                fadeDuration: 400 // New configuration option for animation speed.
            };

            // Merge default settings with user-provided configurations.
            const currentConfig = jq.extend(standardSettings, pluginConfig);

            // Define CSS class names and data attributes used by the plugin for consistency.
            const CLASS_NAMES = {
                VIEWPORT_MONITOR: 'dc-viewport-monitor',
                IMAGE_ITEM: 'dc-image-item',
                LOAD_ITEM: 'dc-load-item',
                STATE_LOADING: 'dc-state-loading',
                STATE_READY: 'dc-state-ready',
                STATE_REMOVABLE: 'dc-state-removable',
                TYPE_XML: 'dc-type-xml',
                TYPE_JSON: 'dc-type-json',
                TYPE_SCRIPT: 'dc-type-script',
                ACTION_REPLACE: 'dc-action-replace',
                ACTION_APPEND: 'dc-action-append',
                ACTION_PREPEND: 'dc-action-prepend',
                ACTION_BEFORE: 'dc-action-before',
                ACTION_AFTER: 'dc-action-after',
                ACTION_REPEAT: 'dc-action-repeat',
                CONTENT_WRAPPER: 'dc-content-wrapper'
            };

            const DATA_ATTR = {
                DEBUG: 'enableDebugging',
                SRC_URL: 'srcAttribute', // Renamed from 'rel'
                INLINE_CONTENT: 'inlineContentAttribute', // Renamed from 'rev'
                FRAGMENT_SELECTOR: 'fragmentSelectorData' // Renamed from 'load'
            };

            const containerEl = jq(this);
            let loadDebounceId; // Timer for debouncing scroll/resize events.

            /**
             * Utility function for logging messages if debugging is enabled.
             * @param {object} elementConfig - The data configuration object for the current element.
             * @param {string} message - The message to log.
             */
            const logMessage = function(elementConfig, message) {
                if (elementConfig && elementConfig[DATA_ATTR.DEBUG]) {
                    try {
                        console.log(`[DCL] ${message}`);
                    } catch (e) {
                        // Fallback for environments without console.log
                    }
                }
            };

            /**
             * Determines if a content element is currently visible within its viewport monitor.
             * This function checks for any overlap between the two given jQuery elements.
             * @param {jQuery} viewportElement - The container element defining the viewport.
             * @param {jQuery} contentElement - The element whose visibility is to be checked.
             * @returns {boolean} True if the contentElement is visible within the viewportElement, false otherwise.
             */
            const checkVisibilityOverlap = function(viewportElement, contentElement){
                // Retrieve bounding box coordinates for the viewport.
                const vpOffset = viewportElement.offset();
                const vpLeft = vpOffset.left;
                const vpTop = vpOffset.top;
                const vpRight = vpLeft + viewportElement.outerWidth();
                const vpBottom = vpTop + viewportElement.outerHeight();

                // Retrieve bounding box coordinates for the content element.
                const ceOffset = contentElement.offset();
                const ceLeft = ceOffset.left;
                const ceTop = ceOffset.top;
                const ceRight = ceLeft + contentElement.outerWidth();
                const ceBottom = ceTop + contentElement.outerHeight();

                // Check for overlap on both axes.
                // An overlap occurs if:
                // (ceLeft < vpRight AND ceRight > vpLeft) AND (ceTop < vpBottom AND ceBottom > vpTop)
                const horizontalOverlap = ceLeft < vpRight && ceRight > vpLeft;
                const verticalOverlap = ceTop < vpBottom && ceBottom > vpTop;

                return horizontalOverlap && verticalOverlap;
            };

            /**
             * Reveals the loaded content and cleans up loading indicators.
             * @param {string} uniqueKey - A unique identifier for the content wrapper.
             * @param {jQuery} itemEl - The original element that triggered the load.
             */
            const displayContentAndCleanUp = function(uniqueKey, itemEl) {
                const loadingDiv = jq(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                const contentDiv = jq(`.${CLASS_NAMES.CONTENT_WRAPPER}-${uniqueKey}`);

                if (currentConfig.loadingIndicatorMarkup) {
                    loadingDiv.fadeOut(currentConfig.fadeDuration, function() {
                        contentDiv.fadeIn(currentConfig.fadeDuration);
                        jq(this).remove(); // Remove the loading indicator after fading out
                    });
                } else {
                    contentDiv.fadeIn(currentConfig.fadeDuration);
                }

                itemEl.removeClass(CLASS_NAMES.STATE_LOADING);
                if (!itemEl.hasClass(CLASS_NAMES.ACTION_REPEAT)) {
                    itemEl.addClass(CLASS_NAMES.STATE_READY);
                }
            };

            /**
             * Handles the retrieval and insertion of content, then calls displayContentAndCleanUp.
             * This function abstracts common AJAX and content loading patterns.
             * @param {jQuery} itemEl - The element being processed.
             * @param {string} uniqueKey - A unique identifier for the content.
             * @param {string} requestDataType - The expected data type for AJAX requests (e.g., 'html', 'json').
             * @param {string} contentAction - The action to perform (e.g., 'replace', 'append').
             */
            const handleContentRetrieval = function(itemEl, uniqueKey, requestDataType, contentAction) {
                const itemConfig = itemEl.data();
                const src = itemConfig[DATA_ATTR.SRC_URL];
                const inlineContent = itemConfig[DATA_ATTR.INLINE_CONTENT];
                const fragment = itemConfig[DATA_ATTR.FRAGMENT_SELECTOR];
                const placeholderHtml = `<div style="display:none" id="${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}" class="${CLASS_NAMES.CONTENT_WRAPPER} ${CLASS_NAMES.CONTENT_WRAPPER}-${uniqueKey}"></div>`;

                // Helper to insert content after AJAX or inline load
                const insertAndDisplay = function(content) {
                    let targetEl = itemEl;
                    // For 'replace' action, the target for insertion is effectively the parent,
                    // and we replace the original itemEl later.
                    if (contentAction === 'replace') {
                        itemEl.replaceWith(placeholderHtml);
                        targetEl = jq(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                        targetEl.html(content);
                    } else if (contentAction === 'append') {
                        itemEl.append(placeholderHtml);
                        targetEl = itemEl.find(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                        targetEl.html(content);
                    } else if (contentAction === 'prepend') {
                        itemEl.prepend(placeholderHtml);
                        targetEl = itemEl.find(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                        targetEl.html(content);
                    } else if (contentAction === 'before') {
                        itemEl.before(placeholderHtml);
                        targetEl = itemEl.prev(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                        targetEl.html(content);
                    } else if (contentAction === 'after') {
                        itemEl.after(placeholderHtml);
                        targetEl = itemEl.next(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`);
                        targetEl.html(content);
                    }
                    displayContentAndCleanUp(uniqueKey, itemEl);
                };

                if (src) {
                    let finalSrc = src;
                    // Add a cache-buster to the URL.
                    const cacheBusterParam = `cacheBuster=${Math.round(Math.random() * 10000)}`;
                    finalSrc += (finalSrc.indexOf('?') > -1 ? '&' : '?') + cacheBusterParam;

                    if (fragment) {
                        logMessage(itemConfig, `Loading fragment '${fragment}' from '${finalSrc}'`);
                        // For .load(), the content is directly inserted into the target.
                        // We need a temporary wrapper for consistent fade-in.
                        if (contentAction === 'replace') {
                            itemEl.replaceWith(placeholderHtml);
                        } else if (contentAction === 'append') {
                            itemEl.append(placeholderHtml);
                        } else if (contentAction === 'prepend') {
                            itemEl.prepend(placeholderHtml);
                        } else if (contentAction === 'before') {
                            itemEl.before(placeholderHtml);
                        } else if (contentAction === 'after') {
                            itemEl.after(placeholderHtml);
                        }

                        jq(`#${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}`).load(`${finalSrc} ${fragment}`, function(response, status, xhr) {
                            if (status === "error") {
                                logMessage(itemConfig, `Error loading fragment: ${xhr.status} ${xhr.statusText}`);
                                jq(this).html(`<div class="dc-error-message">Failed to load content.</div>`);
                            }
                            displayContentAndCleanUp(uniqueKey, itemEl);
                        });
                    } else {
                        logMessage(itemConfig, `Fetching content from '${finalSrc}'`);
                        jq.get(finalSrc, { cacheBuster: Math.round(Math.random() * 10000) }, function(response) {
                            insertAndDisplay(response);
                        }, requestDataType).fail(function(xhr, status, error) {
                            logMessage(itemConfig, `AJAX error: ${status} - ${error}`);
                            insertAndDisplay(`<div class="dc-error-message">Failed to fetch data: ${error}</div>`);
                        });
                    }
                } else if (inlineContent) {
                    logMessage(itemConfig, `Using inline content from data attribute.`);
                    insertAndDisplay(inlineContent);
                } else {
                    logMessage(itemConfig, `No source (srcAttribute or inlineContentAttribute) found for element.`);
                    itemEl.removeClass(CLASS_NAMES.STATE_LOADING); // Ensure loading state is cleared.
                }
            };


            /**
             * The primary function to scan for elements and initiate deferred loading.
             * This function is debounced for scroll/resize events.
             */
            const executeDeferredLoading = function(){
                // Ensure the container has a position for relative positioning of children if needed.
                // Only apply if 'position' is not set or is 'static'.
                if (!containerEl.css('position') || containerEl.css('position') === 'static') {
                    containerEl.css('position', 'relative');
                }

                let viewportWidthPx, viewportHeightPx, containerScrollY, containerScrollX;

                // Determine the effective viewport dimensions and scroll positions.
                if (containerEl.is("body")) {
                    viewportWidthPx = jq(window).width();
                    viewportHeightPx = jq(window).height();
                    containerScrollY = jq(window).scrollTop();
                    containerScrollX = jq(window).scrollLeft();
                } else {
                    viewportWidthPx = containerEl.width();
                    viewportHeightPx = containerEl.height();
                    containerScrollY = containerEl.scrollTop();
                    containerScrollX = containerEl.scrollLeft();
                }

                // Create or update the visibility monitor box.
                // This box serves as the 'mother' element for visibility checks.
                let monitorEl = containerEl.find(`.${CLASS_NAMES.VIEWPORT_MONITOR}`);
                if (!monitorEl.length) {
                    // Add the monitor box if it doesn't exist.
                    containerEl.prepend(`<div class="${CLASS_NAMES.VIEWPORT_MONITOR}"></div>`);
                    monitorEl = containerEl.find(`.${CLASS_NAMES.VIEWPORT_MONITOR}`);
                }

                monitorEl.css({
                    'width': `${viewportWidthPx}px`,
                    'height': `${viewportHeightPx}px`,
                    'position': 'absolute',
                    'top': `${containerScrollY}px`,
                    'left': `${containerScrollX}px`,
                    'padding': '0px',
                    'margin': '0px',
                    'display': 'block' // Ensure it's visible for calculations
                });

                // Process elements designated for deferred image loading.
                jq(`.${CLASS_NAMES.IMAGE_ITEM}`).not(`.${CLASS_NAMES.STATE_LOADING}, .${CLASS_NAMES.STATE_READY}`).forEachElement(function() {
                    const itemEl = jq(this);
                    const uniqueKey = Math.random().toString(36).substring(2, 10); // More robust unique ID.
                    const itemConfig = itemEl.data();

                    if (checkVisibilityOverlap(monitorEl, itemEl)) {
                        logMessage(itemConfig, "Image item detected in viewport, initiating load.");
                        itemEl.addClass(CLASS_NAMES.STATE_LOADING);
                        itemEl.html(`<div id="${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}" class="${CLASS_NAMES.STATE_LOADING}-${uniqueKey}">${currentConfig.loadingIndicatorMarkup}</div>`);

                        let resourceURL = itemEl.attr(DATA_ATTR.SRC_URL);
                        if (!resourceURL) {
                            logMessage(itemConfig, `No srcAttribute found for image item. Skipping.`);
                            itemEl.removeClass(CLASS_NAMES.STATE_LOADING);
                            return;
                        }

                        // Add a cache-buster.
                        const cacheBusterParam = `_cb=${Math.round(Math.random()*10000)}`;
                        resourceURL += (resourceURL.indexOf('?') > -1 ? '&' : '?') + cacheBusterParam;

                        const tempImageObject = new Image();
                        tempImageObject.src = resourceURL;
                        tempImageObject.onload = function(){
                            itemEl.append(`<img style="display:none" id="${CLASS_NAMES.CONTENT_WRAPPER}-${uniqueKey}" class="${CLASS_NAMES.CONTENT_WRAPPER} ${CLASS_NAMES.CONTENT_WRAPPER}-${uniqueKey}" src="${resourceURL}" alt="Loaded Image" />`);
                            logMessage(itemConfig, "Image preloading complete.");
                            displayContentAndCleanUp(uniqueKey, itemEl);
                        };
                        tempImageObject.onerror = function() {
                            logMessage(itemConfig, `Failed to load image: ${resourceURL}`);
                            itemEl.html(`<div class="dc-error-message">Error loading image.</div>`);
                            itemEl.removeClass(CLASS_NAMES.STATE_LOADING);
                        };
                    }
                });

                // Process general deferred content loading items.
                jq(`.${CLASS_NAMES.LOAD_ITEM}`).not(`.${CLASS_NAMES.STATE_LOADING}, .${CLASS_NAMES.STATE_READY}`).forEachElement(function(){
                    const itemEl = jq(this);
                    const uniqueKey = Math.random().toString(36).substring(2, 10);
                    const itemConfig = itemEl.data();
                    let requestDataType = 'html'; // Default AJAX data type.

                    if (checkVisibilityOverlap(monitorEl, itemEl)) {
                        itemEl.addClass(CLASS_NAMES.STATE_LOADING);
                        logMessage(itemConfig, "Content item detected in viewport, initiating load.");

                        if (itemEl.hasClass(CLASS_NAMES.TYPE_XML)) {
                            requestDataType = 'xml';
                        } else if (itemEl.hasClass(CLASS_NAMES.TYPE_JSON)) {
                            requestDataType = 'json';
                        } else if (itemEl.hasClass(CLASS_NAMES.TYPE_SCRIPT)) {
                            requestDataType = 'script';
                        }
                        logMessage(itemConfig, `Determined data type: ${requestDataType}`);

                        // Add loading indicator if configured.
                        if (currentConfig.loadingIndicatorMarkup) {
                            itemEl.html(`<div id="${CLASS_NAMES.LOAD_ITEM}-${uniqueKey}" class="${CLASS_NAMES.STATE_LOADING}-${uniqueKey}">${currentConfig.loadingIndicatorMarkup}</div>`);
                            logMessage(itemConfig, "Loading indicator applied.");
                        }

                        // Determine the content action and call the general handler.
                        if (itemEl.hasClass(CLASS_NAMES.ACTION_REPLACE)) {
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'replace');
                        } else if (itemEl.hasClass(CLASS_NAMES.ACTION_APPEND)) {
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'append');
                        } else if (itemEl.hasClass(CLASS_NAMES.ACTION_PREPEND)) {
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'prepend');
                        } else if (itemEl.hasClass(CLASS_NAMES.ACTION_BEFORE)) {
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'before');
                        } else if (itemEl.hasClass(CLASS_NAMES.ACTION_AFTER)) {
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'after');
                        } else if (itemEl.hasClass(CLASS_NAMES.ACTION_REPEAT)) {
                            // Similar to 'before' for repeat, but doesn't set STATE_READY
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'before');
                        } else {
                            // Default behavior (e.g., append if no specific action class)
                            handleContentRetrieval(itemEl, uniqueKey, requestDataType, 'append');
                        }
                    }
                });

                // Process elements marked for removal when they become visible.
                jq(`.${CLASS_NAMES.STATE_REMOVABLE}`).forEachElement(function(){
                    const itemEl = jq(this);
                    const itemConfig = itemEl.data();

                    // Only remove if it's already loaded and now visible again.
                    if (itemEl.hasClass(CLASS_NAMES.STATE_READY) && checkVisibilityOverlap(monitorEl, itemEl)) {
                        logMessage(itemConfig, "Removable item detected in viewport, initiating fade out.");
                        if (itemEl.is(':visible')) {
                            itemEl.fadeOut(currentConfig.fadeDuration, function() {
                                jq(this).removeClass(CLASS_NAMES.STATE_READY).remove(); // Remove from DOM after fade.
                                logMessage(itemConfig, "Item removed successfully.");
                            });
                        }
                    }
                });

                // Hide the monitor box after all calculations are done.
                monitorEl.css('display', 'none');
            }; // End of executeDeferredLoading

            // Attach event handlers for scrolling and resizing.
            // Events are namespaced (`.dcl`) to prevent conflicts and allow easy unbinding.
            const eventTarget = containerEl.is("body") ? jq(window) : containerEl;

            eventTarget.on('scroll.dcl', function() {
                clearTimeout(loadDebounceId);
                loadDebounceId = setTimeout(executeDeferredLoading, 250); // Debounce scroll events.
            }).on('resize.dcl', function() {
                // For resize, we might want to re-evaluate immediately or with a shorter debounce.
                // Using the same debounce for simplicity.
                clearTimeout(loadDebounceId);
                loadDebounceId = setTimeout(executeDeferredLoading, 250);
            });

            // Initial call to load any visible content on page load.
            executeDeferredLoading();

            return this; // Return jQuery object for chaining.
        }
    });

})(jQuery);