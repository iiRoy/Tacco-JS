(function($) {
    /**
     * @file A jQuery plugin for creating cyclical scrolling content.
     * @author Code Replicator Bot
     * @date October 26, 2023
     * @version 2.0.0
     * @license MIT
     */

    // Utility function to determine the distance from the scrollable element's bottom edge.
    $.fn.getScrollOffsetFromBottom = function() {
        const scrollElement = $(this); // Cache the jQuery object for efficiency.
        if (scrollElement.is(document)) {
            // For the document, calculate based on body/html height and viewport.
            return Math.max(0, $('html').prop('scrollHeight') - $(window).height() - scrollElement.scrollTop());
        } else {
            // For a specific element, use its scrollHeight and offsetHeight.
            return Math.max(0, scrollElement.prop('scrollHeight') - scrollElement.prop('offsetHeight') - scrollElement.scrollTop());
        }
    };

    /**
     * Main plugin function to enable continuous content looping.
     * @param {object} userOptions - Configuration options for the plugin.
     * @returns {jQuery} The jQuery object for chainability.
     */
    $.fn.loopingContent = function(userOptions) {

        // --- Configuration Setup ---
        const noopCallback = () => {}; // An empty function for default callbacks.

        const initialConfiguration = {
            scrollBehavior: 'downward', // 'downward', 'upward', or 'bidirectional'
            onContentAppended: noopCallback,
            onContentPrepended: noopCallback,
            onLoopForwardBoundary: noopCallback, // Callback when content loops to start after appending
            onLoopBackwardBoundary: noopCallback, // Callback when content loops to end after prepending
            scrollbarDisplay: 'default' // 'default', 'hide', or 'show-y'
        };

        // Merge default and user-provided options.
        const activeConfig = $.extend(true, {}, initialConfiguration, userOptions);

        const targetElement = $(this); // The element on which the plugin is invoked.

        // --- Input Validation ---
        if (!targetElement.length) {
            console.warn("Looping Content: Target element not found or invalid.");
            return this;
        }

        // --- Core Variables ---
        // Determine if the target element is the document itself.
        const isDocumentScroller = targetElement.is(document);
        // Reference to the actual scrollable element (body for document, or the element itself).
        const effectiveScrollContainer = isDocumentScroller ? $('html, body') : targetElement;

        // Store the original height of the scrollable container.
        let baseContainerHeight = targetElement.height();
        // Store the initial content markup to be cloned.
        let originalContentMarkup;
        // Keep track of the last known scroll position to detect scroll direction.
        let previousScrollPosition = targetElement.scrollTop();

        // Flags to track if content was recently appended or prepended.
        let appendedRecently = false;
        let prependedRecently = false;

        // --- Content Initialization ---
        // Wrap the initial content in a unique div.
        if (isDocumentScroller) {
            originalContentMarkup = `<div class="content-cycler-wrapper">${$('body').html()}</div>`;
            $('body').html(originalContentMarkup); // Replace body content with the wrapped version.
        } else {
            originalContentMarkup = `<div class="content-cycler-wrapper">${targetElement.html()}</div>`;
            targetElement.html(originalContentMarkup); // Replace element content with the wrapped version.
        }

        // --- Scrollbar Management ---
        if (activeConfig.scrollbarDisplay && ['hide', 'show-y'].includes(activeConfig.scrollbarDisplay)) {
            const cssProperty = activeConfig.scrollbarDisplay === 'hide' ? 'hidden' : 'scroll';
            if (isDocumentScroller) {
                $('body').css('overflow', cssProperty);
            } else {
                targetElement.css('overflow-y', cssProperty);
            }
        }

        // --- Scroll Event Handler ---
        targetElement.scroll(function() {
            const currentScroll = targetElement.scrollTop();
            const scrollFromBottom = targetElement.getScrollOffsetFromBottom();

            // Detect scroll direction
            const isScrollingDown = currentScroll > previousScrollPosition;
            const isScrollingUp = currentScroll < previousScrollPosition;

            previousScrollPosition = currentScroll; // Update for next comparison.

            // Helper to apply content to the container
            const applyContent = (method) => {
                if (isDocumentScroller) {
                    $('body')[method](originalContentMarkup);
                } else {
                    targetElement[method](originalContentMarkup);
                }
            };

            // Helper to reset content and scroll position for looping
            const resetAndLoop = (isForwardLoop) => {
                if (isDocumentScroller) {
                    $('body').html(originalContentMarkup);
                    // Adjust scroll top for document, considering window height
                    if (isForwardLoop) {
                        effectiveScrollContainer.scrollTop(1);
                    } else {
                        effectiveScrollContainer.scrollTop(baseContainerHeight - $(window).height() - 1);
                    }
                } else {
                    targetElement.html(originalContentMarkup);
                    if (isForwardLoop) {
                        effectiveScrollContainer.scrollTop(1);
                    } else {
                        effectiveScrollContainer.scrollTop(baseContainerHeight - 1);
                    }
                }
                appendedRecently = false;
                prependedRecently = false;
                if (isForwardLoop) activeConfig.onLoopForwardBoundary();
                else activeConfig.onLoopBackwardBoundary();
            };

            // --- Scroll Behavior Logic ---
            switch (activeConfig.scrollBehavior) {
                case 'downward':
                    if (isScrollingDown) {
                        if (scrollFromBottom === 0) {
                            applyContent('append');
                            effectiveScrollContainer.scrollTop(currentScroll); // Maintain current visual position
                            appendedRecently = true;
                            activeConfig.onContentAppended();
                        } else if (currentScroll >= baseContainerHeight) {
                            resetAndLoop(true); // Loop to top
                        }
                    } else if (isScrollingUp && appendedRecently) {
                        // If scrolling up after appending, check if we've scrolled past the original content.
                        if (scrollFromBottom >= baseContainerHeight) {
                            resetAndLoop(false); // Loop to bottom
                        }
                    }
                    break;

                case 'upward':
                    if (isScrollingUp) {
                        if (currentScroll === 0) {
                            applyContent('prepend');
                            effectiveScrollContainer.scrollTop(baseContainerHeight); // Maintain current visual position
                            prependedRecently = true;
                            activeConfig.onContentPrepended();
                        } else if (scrollFromBottom >= baseContainerHeight) {
                            resetAndLoop(false); // Loop to bottom
                        }
                    } else if (isScrollingDown && prependedRecently) {
                        // If scrolling down after prepending, check if we've scrolled past the original content.
                        if (currentScroll >= baseContainerHeight) {
                            resetAndLoop(true); // Loop to top
                        }
                    }
                    break;

                case 'bidirectional':
                    // Scrolling Down
                    if (isScrollingDown) {
                        if (scrollFromBottom === 0) {
                            applyContent('append');
                            effectiveScrollContainer.scrollTop(currentScroll);
                            appendedRecently = true;
                            activeConfig.onContentAppended();
                        } else if (currentScroll >= baseContainerHeight) {
                            resetAndLoop(true); // Loop to top
                        }
                    }
                    // Scrolling Up
                    else if (isScrollingUp) {
                        if (currentScroll === 0) {
                            applyContent('prepend');
                            effectiveScrollContainer.scrollTop(baseContainerHeight);
                            prependedRecently = true;
                            activeConfig.onContentPrepended();
                        } else if (scrollFromBottom >= baseContainerHeight) {
                            resetAndLoop(false); // Loop to bottom
                        }
                    }
                    break;

                default:
                    // Log an error if an unknown scroll behavior is configured.
                    console.error(`Looping Content: Unknown scroll behavior '${activeConfig.scrollBehavior}'.`);
                    break;
            }
        });

        return this; // Enable jQuery method chaining.
    };
})(jQuery);